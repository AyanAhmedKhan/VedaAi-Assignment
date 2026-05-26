param([string]$OutDir = "public/figma/mobile")

$assets = @{
  "illust-bg"        = "30e5df14-cb9d-4a3b-a815-1987a3129bd5"
  "illust-cloud"     = "97bcc8fc-5a31-483e-8178-08fa4d560f6b"
  "illust-lens"      = "85a46f97-a46f-4de6-bca5-72aa16da0aad"
  "illust-doodles"   = "34203886-f333-4fb6-a1ee-47d4e5532841"
  "plus-circle"      = "5bf17218-8511-46cb-b098-493da5566515"
  "plus-fab"         = "007014ce-51ba-4dc8-a5d7-4ba6dc5e73f1"
  "nav-calendar"     = "d85f9c09-62f4-4674-8ec8-fc56ce20addf"
  "nav-filetext"     = "3f383bfd-a643-4456-83db-8a2f9312a6f4"
  "nav-aispark"      = "3f5c4e7b-2bd7-4502-a49d-9e6ee397465f"
  "menu-burger"      = "600318e0-2210-4fd8-bdaa-d048f33ebb41"
  "logo"             = "92422774-3a68-492a-8f2c-49e9daa2319f"
  "bell"             = "d6af345a-d307-4e59-ba4b-74ac311a15ec"
  "bell-clapper"     = "58091547-7018-4531-a62e-c354f834d56f"
  "bell-dot"         = "994cc9aa-1520-4045-b628-9fe39867800d"
  "avatar-john"      = "cdba7414-8897-451b-9cac-2e4cb6edbd25"
  "homebar-line"     = "bec9b08b-6d2d-417e-b1ba-5eb20c1f8f37"
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
