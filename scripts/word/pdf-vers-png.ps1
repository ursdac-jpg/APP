# Rend une page d'un PDF en image PNG (API Windows.Data.Pdf). Usage : -pdf f.pdf -png f.png [-page 0] [-scale 1.5]
param([string]$pdf,[string]$png,[int]$page=0,[double]$scale=1.5)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
function Await($op,[Type]$t){ $m=([System.WindowsRuntimeSystemExtensions].GetMethods()|?{$_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'})[0].MakeGenericMethod($t); $tk=$m.Invoke($null,@($op)); $tk.Wait(-1)|Out-Null; $tk.Result }
function AwaitAction($op){ $m=([System.WindowsRuntimeSystemExtensions].GetMethods()|?{$_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'})[0]; $tk=$m.Invoke($null,@($op)); $tk.Wait(-1)|Out-Null }
$f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdf)) ([Windows.Storage.StorageFile])
$doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($f)) ([Windows.Data.Pdf.PdfDocument])
$p = $doc.GetPage($page)
$ms = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
$opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions
$opt.DestinationWidth = [uint32]($p.Size.Width * $scale)
AwaitAction ($p.RenderToStreamAsync($ms,$opt))
$ms.Seek(0)
$reader = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($ms)
$fs = [System.IO.File]::Create($png); $reader.CopyTo($fs); $fs.Close()
"pages=$($doc.PageCount) size=$($p.Size.Width)x$($p.Size.Height)"
