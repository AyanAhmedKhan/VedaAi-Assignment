param([string]$OutDir = "public/figma/screen3")

$assets = @{
  "illust-bg"        = "5b545b1c-7371-48cd-b309-0694a85fdfe9"
  "illust-cloud"     = "c378dec9-38fe-48aa-9e7b-6737b6dee856"
  "illust-lens"      = "74dedca7-8475-424f-8108-7131075f5551"
  "illust-doodles"   = "11f67f63-075c-476c-9cb7-fdbd4369ef28"
  "plus-bold"        = "8ac6700d-8b51-4b88-bdbf-12055bcbd1d6"
  "logo-bg"          = "ede66d66-8d93-4273-8c19-e05f01cb2d1f"
  "logo-mark"        = "0233c8e1-f515-403c-a5e8-b4b0f3430e4f"
  "logo-spark"       = "9eb05f1c-ccff-4188-b6ea-ca262920a708"
  "avatar-school"    = "d104133d-2e1c-46c4-abfa-62875b32d10f"
  "avatar-john"      = "12f463e5-f1b0-4c41-a831-bbc90b85cc96"
  "arrow-left-24"    = "949efcdf-26dc-43ff-a1c7-dfe31025c0a0"
  "home-grid"        = "02704768-664c-4e6a-8f8d-906e54e09be2"
  "bell"             = "f9b85f0a-a8cc-4897-a5c3-d0b18a56850f"
  "bell-clapper"     = "db3a22b1-59b9-4ebf-975b-726f584bdd82"
  "bell-dot"         = "8f1d2e1e-6979-4676-8f1c-93cf24d35b26"
  "chevron-down"     = "4aa2b8e2-7bf6-48b0-a373-11d110210b01"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$base = "https://www.figma.com/api/mcp/asset/"
$ok = 0
foreach ($k in $assets.Keys) {
  $url = $base + $assets[$k]
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
    $ct = $resp.Headers['Content-Type']; if ($ct -is [array]) { $ct = $ct[0] }
    $ext = if ($ct -match 'svg') { '.svg' } elseif ($ct -match 'png') { '.png' } elseif ($ct -match 'jpe?g') { '.jpg' } else { '.bin' }
    $out = Join-Path $OutDir ($k + $ext)
    if ($resp.Content -is [string]) {
      [IO.File]::WriteAllText($out, $resp.Content, [Text.UTF8Encoding]::new($false))
    } else { [IO.File]::WriteAllBytes($out, $resp.Content) }
    $ok++
  } catch { Write-Host "FAIL $k" }
}
Write-Host "Downloaded $ok / $($assets.Count)"
