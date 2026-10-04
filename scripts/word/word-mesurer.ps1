# Pilote Word en arrière-plan (instance SÉPARÉE, invisible, minuteur de sécurité).
# Ouvre un .docx en lecture seule, l'enregistre en PDF, mesure le nombre de pages et
# (option) la position de chaque mot (points, repère de la page) dans un fichier JSON.
# Ne ferme JAMAIS une instance de Word qui existait avant le lancement (documents de Denis).
# Usage : powershell -NoProfile -ExecutionPolicy Bypass -File word-mesurer.ps1 -entree cv.docx -pdf cv.pdf [-json mots.json] [-minuteur 90]
param(
  [Parameter(Mandatory = $true)][string]$entree,
  [Parameter(Mandatory = $true)][string]$pdf,
  [string]$json = "",
  [int]$minuteur = 90
)
$avant = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
$travail = Start-Job -ScriptBlock {
  param($entree, $pdf, $json)
  $w = New-Object -ComObject Word.Application
  $w.Visible = $false
  $w.DisplayAlerts = 0
  try {
    $d = $w.Documents.Open($entree, $false, $true)
    $pages = $d.ComputeStatistics(2)
    $mots = @()
    if ($json -ne "") {
      foreach ($m in $d.Words) {
        $t = $m.Text
        if ($t.Trim().Length -eq 0) { continue }
        $mots += [pscustomobject]@{
          t = $t.Trim()
          p = [int]$m.Information(3)
          # Word donne la position du texte SANS le retrait gauche du paragraphe : on l'ajoute (constate par essai, 2026-09-27)
          x = [math]::Round([double]$m.Information(5) + [double]$m.ParagraphFormat.LeftIndent, 1)
          y = [math]::Round([double]$m.Information(6), 1)
        }
      }
    }
    $d.SaveAs2($pdf, 17)
    $d.Close($false)
    if ($json -ne "") {
      (@{ pages = $pages; mots = $mots } | ConvertTo-Json -Depth 4 -Compress) | Out-File -FilePath $json -Encoding utf8
    }
    "OK pages=$pages"
  } catch { "ERREUR: " + $_.Exception.Message }
  finally { try { $w.Quit() } catch {} }
} -ArgumentList $entree, $pdf, $json
if (Wait-Job $travail -Timeout $minuteur) { Receive-Job $travail } else { "MINUTEUR: Word bloqué (fichier probablement invalide)"; Stop-Job $travail }
Remove-Job $travail -Force -ErrorAction SilentlyContinue
# Ne tue que les instances lancées par ce script.
Get-Process WINWORD -ErrorAction SilentlyContinue | Where-Object { $avant -notcontains $_.Id } | ForEach-Object { Stop-Process -Id $_.Id -Force }
