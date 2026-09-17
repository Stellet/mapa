param([switch]$Force)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$manifest=Get-Content (Join-Path $root 'data/import/image-sources-floor-1.json') -Raw -Encoding UTF8|ConvertFrom-Json
$out=Join-Path $root 'obras/imagens'; New-Item -ItemType Directory $out -Force|Out-Null
$downloaded=@();$ignored=@();$failed=@()
function FileId($s){if(!$s-or$s-match'/folders/'){return};if($s-match'/file/d/([^/?#]+)'){return $Matches[1]};if($s-match'[?&]id=([^&#]+)'){return $Matches[1]}}
function Ext([byte[]]$b,$t){
 if($b.Length-ge3-and$b[0]-eq255-and$b[1]-eq216-and$b[2]-eq255){return '.jpg'}
 if($b.Length-ge8-and$b[0]-eq137-and$b[1]-eq80-and$b[2]-eq78-and$b[3]-eq71){return '.png'}
 if($b.Length-ge6-and[Text.Encoding]::ASCII.GetString($b,0,6)-match'^GIF8'){return '.gif'}
 if($b.Length-ge12-and[Text.Encoding]::ASCII.GetString($b,0,4)-eq'RIFF'-and[Text.Encoding]::ASCII.GetString($b,8,4)-eq'WEBP'){return '.webp'}
 if($b.Length-ge2-and$b[0]-eq66-and$b[1]-eq77){return '.bmp'}
 if($b.Length-ge4-and(($b[0]-eq73-and$b[1]-eq73-and$b[2]-eq42)-or($b[0]-eq77-and$b[1]-eq77-and$b[3]-eq42))){return '.tif'}
 if($b.Length-ge12-and[Text.Encoding]::ASCII.GetString($b,4,4)-eq'ftyp'){$x=[Text.Encoding]::ASCII.GetString($b,8,4);if($x -in 'avif','avis'){return '.avif'};if($x -in 'heic','heix','hevc','hevx'){return '.heic'}}
 if($t-eq'image/svg+xml'){$x=[Text.Encoding]::UTF8.GetString($b,0,[Math]::Min($b.Length,4096));if($x-match'<svg(?:\s|>)'){return '.svg'}}
}
Add-Type -AssemblyName System.Net.Http
$h=New-Object Net.Http.HttpClientHandler;$h.AllowAutoRedirect=$true;$c=New-Object Net.Http.HttpClient($h);$c.Timeout=[TimeSpan]::FromSeconds(30);$c.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0')
try{foreach($i in $manifest.items){$n=([int]$i.id).ToString('000');if(!$i.source){$ignored+="$n source=null";continue};$fid=FileId $i.source;if(!$fid){$ignored+="$n link inválido/pasta";continue};$old=@(Get-ChildItem $out -File| Where-Object BaseName -eq $n);if($old-and!$Force){$ignored+="$n existente";continue};try{$r=$c.GetAsync("https://drive.usercontent.google.com/download?id=$fid&export=download&confirm=t").Result;if(!$r.IsSuccessStatusCode){throw "HTTP $([int]$r.StatusCode)"};$b=$r.Content.ReadAsByteArrayAsync().Result;$t=if($r.Content.Headers.ContentType){$r.Content.Headers.ContentType.MediaType}else{''};$e=Ext $b $t;if(!$e){throw "conteúdo não é imagem ($t)"};$target=Join-Path $out($n+$e);[IO.File]::WriteAllBytes($target,$b);if($Force){$old| Where-Object FullName -ne $target | Remove-Item -Force};$downloaded+="$n $e"}catch{$failed+="$n $($_.Exception.Message)"}}}finally{$c.Dispose();$h.Dispose()}
"BAIXADOS ($($downloaded.Count))";$downloaded|%{"  $_"};"IGNORADOS ($($ignored.Count))";$ignored|%{"  $_"};"FALHAS ($($failed.Count))";$failed|%{"  $_"}
