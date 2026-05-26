param([string]$OutDir = "public/figma/screen1")

$assets = @{
  "vector"            = "8aa16e5e-dce7-4a89-90db-e7c1e7512d8d"
  "vector1"           = "28ff98e9-e388-4c6d-bad7-97f533a09c2d"
  "icon-book"         = "44a457f1-ad68-4a6e-96ed-bcd796b22648"
  "vector5"           = "92bac748-028d-474f-9511-de858ac55c12"
  "vector6"           = "dd619199-3c40-4fa8-ada9-7bae89ed9e60"
  "rect14"            = "36a2ae62-43d8-4877-9a1b-6a861d9e2bf9"
  "rect15"            = "3f3d5ec1-3054-4bc9-aa1e-6d5c5b234804"
  "vector2"           = "2a41d981-9946-4eba-ac64-ee2fa9194f0f"
  "vector3"           = "987ff131-8af8-43ce-ab37-e15ae1c32764"
  "icon-upload-cloud" = "16379882-298f-4e48-8d3f-46ae8d1e0475"
  "logo-bg"           = "ac651011-7cd4-45aa-bf5c-382c7ebe46db"
  "avatar"            = "53be55c9-18df-4caa-a761-d8773d45f513"
  "avatar-john"       = "16c5f4a2-97a0-4198-ba5c-da6c045fd79c"
  "ellipse16"         = "c31a1405-0126-4af0-aaf3-af33ae9835c5"
  "ellipse10"         = "01e9e63b-4075-4454-b436-b2c095a88ea5"
  "step-line1"        = "295b83e3-ec4a-4da9-bdd9-fc4b901de491"
  "step-line2"        = "91ec7a10-a03a-4d3c-8a8c-9a7571dc2049"
  "rect14-stroke"     = "fce1cc71-e13b-4ac6-b45e-2d99621591d8"
  "vector8-stroke"    = "e7ff81d9-a4ac-4689-8e7a-beeeaf2da7e9"
  "vector-stroke"     = "4c310df2-b421-4a9d-ad39-54dbdee7fd5b"
  "chevron-down"      = "85ae00d1-a82e-45db-bec4-82f26f475263"
  "x-close"           = "8fa2fbf7-cd59-44de-be2a-667f20d56de8"
  "plus-bold"         = "0f0b82db-c5ef-478d-ab8f-ce7521d2d053"
  "minus-stroke"      = "e4a689d8-0bd1-47a6-8f16-718ffae2185e"
  "plus-thin"         = "4076c5b3-33a3-494a-8ce2-37f7cdeaf3d5"
  "mic-circle"        = "f04ff695-8081-41cb-8fa4-2ace4cf217db"
  "mic-icon"          = "7a49eaae-ab98-4e18-9422-a863226b4e39"
  "arrow-left"        = "8d806578-ebf8-4eea-9277-b1f9313f9139"
  "arrow-right"       = "394973c5-e160-4869-94ab-d0b8646e6b50"
  "logo-mark"         = "bfa675d5-90e7-41fb-acf8-3bc514542fed"
  "logo-spark"        = "c2adde0b-4b53-40fa-aab1-cf38be11abf2"
  "settings-stroke"   = "53086880-ec18-47c4-a580-66dfebc945a0"
  "settings-union"    = "d201a117-d256-47d8-bf6e-a2b21af396f2"
  "arrow-left-24"     = "e6a5d299-6652-4daa-bd8f-979205452b2d"
  "bell"              = "dcbc9acd-57e1-4d2b-b87c-241369154dd6"
  "bell-clapper"      = "9e14f5f2-71be-499f-8b25-80e14c9df2fb"
  "bell-dot"          = "5c052c6e-4726-4a0e-8ad4-b97749da7e6f"
  "chevron-down-lg"   = "b2fae6a5-b9a6-4e5f-9e6a-ea805828b931"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$base = "https://www.figma.com/api/mcp/asset/"

$ok = 0; $fail = 0
foreach ($k in $assets.Keys) {
  $url = $base + $assets[$k]
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
    $ct = $resp.Headers['Content-Type']
    if ($ct -is [array]) { $ct = $ct[0] }
    $ext = if ($ct -match 'svg') { '.svg' } elseif ($ct -match 'png') { '.png' } elseif ($ct -match 'jpe?g') { '.jpg' } else { '.bin' }
    $out = Join-Path $OutDir ($k + $ext)
    if ($resp.Content -is [string]) {
      [IO.File]::WriteAllText($out, $resp.Content, [Text.UTF8Encoding]::new($false))
    } else {
      [IO.File]::WriteAllBytes($out, $resp.Content)
    }
    $ok++
  } catch {
    Write-Host "FAIL $k : $($_.Exception.Message)"
    $fail++
  }
}
Write-Host "Downloaded $ok / $($assets.Count). Failures: $fail"
