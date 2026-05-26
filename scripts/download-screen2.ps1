param([string]$OutDir = "public/figma/screen2")

$assets = @{
  "icon-book"        = "f61ab266-51a2-4805-806a-898d5fb1e76d"
  "vector-mygroups"  = "76ad9611-953f-4f24-b60a-aca54e1bc936"
  "vector-home"      = "40876b8f-7042-4ae2-9137-2874b6d6e557"
  "logo-bg"          = "2138ee46-0bbc-4511-b337-9eb0cc4f5689"
  "avatar-school"    = "b4601d4b-b359-455e-bb2c-50912aab8e81"
  "avatar-john"      = "092ae7b3-1772-43dc-856a-b7c73d621f1e"
  "card-thumb"       = "91479f9d-dfff-4d79-8c35-002ac236d58a"
  "glow-ellipse"     = "0741d0ba-4208-4fbe-963a-f2516d1ac400"
  "green-dot"        = "1dcaaeaf-7b28-481d-9e9b-4ad2c12ae40a"
  "filter-icon"      = "96c1c150-7a1c-4271-8bf1-9293ffcda638"
  "search-icon"      = "b30b4284-6431-4e8b-ac5f-e38445b3295f"
  "more-vertical"    = "be36030f-5c6e-466f-9604-766e9468ca25"
  "logo-mark"        = "e5abfd17-2795-4e4d-b18a-9a89329b2347"
  "logo-spark"       = "047cb7d4-168c-4c0c-8572-1c966c7bb7a3"
  "icon-asgmts-1"    = "8f625b49-350b-4411-902a-86c098340f1a"
  "icon-asgmts-2"    = "ae3bf9aa-5879-4362-92a1-3315c3686e2f"
  "icon-asgmts-3"    = "3aa45c08-94a7-4365-b01f-7bdc710f24c6"
  "icon-asgmts-4"    = "1eb33c52-24fd-40d8-b2c2-b9399bcbaaab"
  "icon-credit-1"    = "3408f109-f31a-4331-a905-344ab20f5ec1"
  "icon-credit-2"    = "9af53ccf-6dc6-4a8d-b5fe-a060b1a72a0f"
  "settings-stroke"  = "f2cf2025-c0f4-4723-98d5-cd611cacd7f9"
  "settings-union"   = "93b0d547-f90d-4f1a-b107-e1ecd311cb7d"
  "arrow-left-24"    = "f982abb0-b09a-4883-825d-bd16cabdbfc2"
  "home-grid"        = "98d0efb5-d749-41b5-8705-336e1712768c"
  "bell"             = "4b2040c9-23fc-48d0-8a86-841929ab72f5"
  "bell-clapper"     = "ef275c04-b35d-42c8-9519-de2adee26264"
  "bell-dot"         = "5c73b964-b824-4be6-a0f2-354418c6c1e5"
  "chevron-down"     = "94c976cc-953e-4eb3-a9a8-b11e8e9e980a"
  "plus-icon"        = "046d97a8-a4fa-43ef-a81c-726ebeb992be"
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
