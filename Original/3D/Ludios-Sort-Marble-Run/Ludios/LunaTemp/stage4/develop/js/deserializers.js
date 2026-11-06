var Deserializers = {}
Deserializers["UnityEngine.JointSpring"] = function (request, data, root) {
  var i586 = root || request.c( 'UnityEngine.JointSpring' )
  var i587 = data
  i586.spring = i587[0]
  i586.damper = i587[1]
  i586.targetPosition = i587[2]
  return i586
}

Deserializers["UnityEngine.JointMotor"] = function (request, data, root) {
  var i588 = root || request.c( 'UnityEngine.JointMotor' )
  var i589 = data
  i588.m_TargetVelocity = i589[0]
  i588.m_Force = i589[1]
  i588.m_FreeSpin = i589[2]
  return i588
}

Deserializers["UnityEngine.JointLimits"] = function (request, data, root) {
  var i590 = root || request.c( 'UnityEngine.JointLimits' )
  var i591 = data
  i590.m_Min = i591[0]
  i590.m_Max = i591[1]
  i590.m_Bounciness = i591[2]
  i590.m_BounceMinVelocity = i591[3]
  i590.m_ContactDistance = i591[4]
  i590.minBounce = i591[5]
  i590.maxBounce = i591[6]
  return i590
}

Deserializers["UnityEngine.JointDrive"] = function (request, data, root) {
  var i592 = root || request.c( 'UnityEngine.JointDrive' )
  var i593 = data
  i592.m_PositionSpring = i593[0]
  i592.m_PositionDamper = i593[1]
  i592.m_MaximumForce = i593[2]
  i592.m_UseAcceleration = i593[3]
  return i592
}

Deserializers["UnityEngine.SoftJointLimitSpring"] = function (request, data, root) {
  var i594 = root || request.c( 'UnityEngine.SoftJointLimitSpring' )
  var i595 = data
  i594.m_Spring = i595[0]
  i594.m_Damper = i595[1]
  return i594
}

Deserializers["UnityEngine.SoftJointLimit"] = function (request, data, root) {
  var i596 = root || request.c( 'UnityEngine.SoftJointLimit' )
  var i597 = data
  i596.m_Limit = i597[0]
  i596.m_Bounciness = i597[1]
  i596.m_ContactDistance = i597[2]
  return i596
}

Deserializers["UnityEngine.WheelFrictionCurve"] = function (request, data, root) {
  var i598 = root || request.c( 'UnityEngine.WheelFrictionCurve' )
  var i599 = data
  i598.m_ExtremumSlip = i599[0]
  i598.m_ExtremumValue = i599[1]
  i598.m_AsymptoteSlip = i599[2]
  i598.m_AsymptoteValue = i599[3]
  i598.m_Stiffness = i599[4]
  return i598
}

Deserializers["UnityEngine.JointAngleLimits2D"] = function (request, data, root) {
  var i600 = root || request.c( 'UnityEngine.JointAngleLimits2D' )
  var i601 = data
  i600.m_LowerAngle = i601[0]
  i600.m_UpperAngle = i601[1]
  return i600
}

Deserializers["UnityEngine.JointMotor2D"] = function (request, data, root) {
  var i602 = root || request.c( 'UnityEngine.JointMotor2D' )
  var i603 = data
  i602.m_MotorSpeed = i603[0]
  i602.m_MaximumMotorTorque = i603[1]
  return i602
}

Deserializers["UnityEngine.JointSuspension2D"] = function (request, data, root) {
  var i604 = root || request.c( 'UnityEngine.JointSuspension2D' )
  var i605 = data
  i604.m_DampingRatio = i605[0]
  i604.m_Frequency = i605[1]
  i604.m_Angle = i605[2]
  return i604
}

Deserializers["UnityEngine.JointTranslationLimits2D"] = function (request, data, root) {
  var i606 = root || request.c( 'UnityEngine.JointTranslationLimits2D' )
  var i607 = data
  i606.m_LowerTranslation = i607[0]
  i606.m_UpperTranslation = i607[1]
  return i606
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh"] = function (request, data, root) {
  var i608 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh' )
  var i609 = data
  i608.name = i609[0]
  i608.halfPrecision = !!i609[1]
  i608.useSimplification = !!i609[2]
  i608.useUInt32IndexFormat = !!i609[3]
  i608.vertexCount = i609[4]
  i608.aabb = i609[5]
  var i611 = i609[6]
  var i610 = []
  for(var i = 0; i < i611.length; i += 1) {
    i610.push( !!i611[i + 0] );
  }
  i608.streams = i610
  i608.vertices = i609[7]
  var i613 = i609[8]
  var i612 = []
  for(var i = 0; i < i613.length; i += 1) {
    i612.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh', i613[i + 0]) );
  }
  i608.subMeshes = i612
  var i615 = i609[9]
  var i614 = []
  for(var i = 0; i < i615.length; i += 16) {
    i614.push( new pc.Mat4().setData(i615[i + 0], i615[i + 1], i615[i + 2], i615[i + 3],  i615[i + 4], i615[i + 5], i615[i + 6], i615[i + 7],  i615[i + 8], i615[i + 9], i615[i + 10], i615[i + 11],  i615[i + 12], i615[i + 13], i615[i + 14], i615[i + 15]) );
  }
  i608.bindposes = i614
  var i617 = i609[10]
  var i616 = []
  for(var i = 0; i < i617.length; i += 1) {
    i616.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape', i617[i + 0]) );
  }
  i608.blendShapes = i616
  return i608
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh"] = function (request, data, root) {
  var i622 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh' )
  var i623 = data
  i622.triangles = i623[0]
  return i622
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape"] = function (request, data, root) {
  var i628 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape' )
  var i629 = data
  i628.name = i629[0]
  var i631 = i629[1]
  var i630 = []
  for(var i = 0; i < i631.length; i += 1) {
    i630.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame', i631[i + 0]) );
  }
  i628.frames = i630
  return i628
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material"] = function (request, data, root) {
  var i632 = root || new pc.UnityMaterial()
  var i633 = data
  i632.name = i633[0]
  request.r(i633[1], i633[2], 0, i632, 'shader')
  i632.renderQueue = i633[3]
  i632.enableInstancing = !!i633[4]
  var i635 = i633[5]
  var i634 = []
  for(var i = 0; i < i635.length; i += 1) {
    i634.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter', i635[i + 0]) );
  }
  i632.floatParameters = i634
  var i637 = i633[6]
  var i636 = []
  for(var i = 0; i < i637.length; i += 1) {
    i636.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter', i637[i + 0]) );
  }
  i632.colorParameters = i636
  var i639 = i633[7]
  var i638 = []
  for(var i = 0; i < i639.length; i += 1) {
    i638.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter', i639[i + 0]) );
  }
  i632.vectorParameters = i638
  var i641 = i633[8]
  var i640 = []
  for(var i = 0; i < i641.length; i += 1) {
    i640.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter', i641[i + 0]) );
  }
  i632.textureParameters = i640
  var i643 = i633[9]
  var i642 = []
  for(var i = 0; i < i643.length; i += 1) {
    i642.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag', i643[i + 0]) );
  }
  i632.materialFlags = i642
  return i632
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter"] = function (request, data, root) {
  var i646 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter' )
  var i647 = data
  i646.name = i647[0]
  i646.value = i647[1]
  return i646
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter"] = function (request, data, root) {
  var i650 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter' )
  var i651 = data
  i650.name = i651[0]
  i650.value = new pc.Color(i651[1], i651[2], i651[3], i651[4])
  return i650
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter"] = function (request, data, root) {
  var i654 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter' )
  var i655 = data
  i654.name = i655[0]
  i654.value = new pc.Vec4( i655[1], i655[2], i655[3], i655[4] )
  return i654
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter"] = function (request, data, root) {
  var i658 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter' )
  var i659 = data
  i658.name = i659[0]
  request.r(i659[1], i659[2], 0, i658, 'value')
  return i658
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag"] = function (request, data, root) {
  var i662 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag' )
  var i663 = data
  i662.name = i663[0]
  i662.enabled = !!i663[1]
  return i662
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Texture2D"] = function (request, data, root) {
  var i664 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Texture2D' )
  var i665 = data
  i664.name = i665[0]
  i664.width = i665[1]
  i664.height = i665[2]
  i664.mipmapCount = i665[3]
  i664.anisoLevel = i665[4]
  i664.filterMode = i665[5]
  i664.hdr = !!i665[6]
  i664.format = i665[7]
  i664.wrapMode = i665[8]
  i664.alphaIsTransparency = !!i665[9]
  i664.alphaSource = i665[10]
  i664.graphicsFormat = i665[11]
  i664.sRGBTexture = !!i665[12]
  i664.desiredColorSpace = i665[13]
  i664.wrapU = i665[14]
  i664.wrapV = i665[15]
  return i664
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Transform"] = function (request, data, root) {
  var i666 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Transform' )
  var i667 = data
  i666.position = new pc.Vec3( i667[0], i667[1], i667[2] )
  i666.scale = new pc.Vec3( i667[3], i667[4], i667[5] )
  i666.rotation = new pc.Quat(i667[6], i667[7], i667[8], i667[9])
  return i666
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshFilter"] = function (request, data, root) {
  var i668 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshFilter' )
  var i669 = data
  request.r(i669[0], i669[1], 0, i668, 'sharedMesh')
  return i668
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshRenderer"] = function (request, data, root) {
  var i670 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshRenderer' )
  var i671 = data
  request.r(i671[0], i671[1], 0, i670, 'additionalVertexStreams')
  i670.enabled = !!i671[2]
  request.r(i671[3], i671[4], 0, i670, 'sharedMaterial')
  var i673 = i671[5]
  var i672 = []
  for(var i = 0; i < i673.length; i += 2) {
  request.r(i673[i + 0], i673[i + 1], 2, i672, '')
  }
  i670.sharedMaterials = i672
  i670.receiveShadows = !!i671[6]
  i670.shadowCastingMode = i671[7]
  i670.sortingLayerID = i671[8]
  i670.sortingOrder = i671[9]
  i670.lightmapIndex = i671[10]
  i670.lightmapSceneIndex = i671[11]
  i670.lightmapScaleOffset = new pc.Vec4( i671[12], i671[13], i671[14], i671[15] )
  i670.lightProbeUsage = i671[16]
  i670.reflectionProbeUsage = i671[17]
  return i670
}

Deserializers["Marble"] = function (request, data, root) {
  var i676 = root || request.c( 'Marble' )
  var i677 = data
  i676.marbleType = i677[0]
  request.r(i677[1], i677[2], 0, i676, 'wrongPromptImage')
  request.r(i677[3], i677[4], 0, i676, 'wrongPromptCanvas')
  return i676
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.SphereCollider"] = function (request, data, root) {
  var i678 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.SphereCollider' )
  var i679 = data
  i678.center = new pc.Vec3( i679[0], i679[1], i679[2] )
  i678.radius = i679[3]
  i678.enabled = !!i679[4]
  i678.isTrigger = !!i679[5]
  request.r(i679[6], i679[7], 0, i678, 'material')
  return i678
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.GameObject"] = function (request, data, root) {
  var i680 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.GameObject' )
  var i681 = data
  i680.name = i681[0]
  i680.tagId = i681[1]
  i680.enabled = !!i681[2]
  i680.isStatic = !!i681[3]
  i680.layer = i681[4]
  return i680
}

Deserializers["Tray"] = function (request, data, root) {
  var i682 = root || request.c( 'Tray' )
  var i683 = data
  i682.trayColor = i683[0]
  var i685 = i683[1]
  var i684 = []
  for(var i = 0; i < i685.length; i += 2) {
  request.r(i685[i + 0], i685[i + 1], 2, i684, '')
  }
  i682.slotPoints = i684
  request.r(i683[2], i683[3], 0, i682, 'failImage')
  request.r(i683[4], i683[5], 0, i682, 'vignetteImage')
  return i682
}

Deserializers["TrayAnimation"] = function (request, data, root) {
  var i688 = root || request.c( 'TrayAnimation' )
  var i689 = data
  request.r(i689[0], i689[1], 0, i688, 'trayMesh')
  request.r(i689[2], i689[3], 0, i688, 'rampWaypoints')
  i688.tipDuration = i689[4]
  i688.returnDuration = i689[5]
  i688.destroyDelay = i689[6]
  return i688
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Cubemap"] = function (request, data, root) {
  var i690 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Cubemap' )
  var i691 = data
  i690.name = i691[0]
  i690.atlasId = i691[1]
  i690.mipmapCount = i691[2]
  i690.hdr = !!i691[3]
  i690.size = i691[4]
  i690.anisoLevel = i691[5]
  i690.filterMode = i691[6]
  var i693 = i691[7]
  var i692 = []
  for(var i = 0; i < i693.length; i += 4) {
    i692.push( UnityEngine.Rect.MinMaxRect(i693[i + 0], i693[i + 1], i693[i + 2], i693[i + 3]) );
  }
  i690.rects = i692
  i690.wrapU = i691[8]
  i690.wrapV = i691[9]
  return i690
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.Scene"] = function (request, data, root) {
  var i696 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.Scene' )
  var i697 = data
  i696.name = i697[0]
  i696.index = i697[1]
  i696.startup = !!i697[2]
  return i696
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Light"] = function (request, data, root) {
  var i698 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Light' )
  var i699 = data
  i698.type = i699[0]
  i698.color = new pc.Color(i699[1], i699[2], i699[3], i699[4])
  i698.cullingMask = i699[5]
  i698.intensity = i699[6]
  i698.range = i699[7]
  i698.spotAngle = i699[8]
  i698.shadows = i699[9]
  i698.shadowNormalBias = i699[10]
  i698.shadowBias = i699[11]
  i698.shadowStrength = i699[12]
  i698.shadowResolution = i699[13]
  i698.lightmapBakeType = i699[14]
  i698.renderMode = i699[15]
  request.r(i699[16], i699[17], 0, i698, 'cookie')
  i698.cookieSize = i699[18]
  i698.shadowNearPlane = i699[19]
  i698.occlusionMaskChannel = i699[20]
  i698.isBaked = !!i699[21]
  i698.mixedLightingMode = i699[22]
  i698.enabled = !!i699[23]
  return i698
}

Deserializers["UnityEngine.Rendering.Universal.UniversalAdditionalLightData"] = function (request, data, root) {
  var i700 = root || request.c( 'UnityEngine.Rendering.Universal.UniversalAdditionalLightData' )
  var i701 = data
  i700.m_Version = i701[0]
  i700.m_UsePipelineSettings = !!i701[1]
  i700.m_AdditionalLightsShadowResolutionTier = i701[2]
  i700.m_LightLayerMask = i701[3]
  i700.m_RenderingLayers = i701[4]
  i700.m_CustomShadowLayers = !!i701[5]
  i700.m_ShadowLayerMask = i701[6]
  i700.m_ShadowRenderingLayers = i701[7]
  i700.m_LightCookieSize = new pc.Vec2( i701[8], i701[9] )
  i700.m_LightCookieOffset = new pc.Vec2( i701[10], i701[11] )
  i700.m_SoftShadowQuality = i701[12]
  return i700
}

Deserializers["UnityEngine.Rendering.Volume"] = function (request, data, root) {
  var i702 = root || request.c( 'UnityEngine.Rendering.Volume' )
  var i703 = data
  i702.priority = i703[0]
  i702.blendDistance = i703[1]
  i702.weight = i703[2]
  request.r(i703[3], i703[4], 0, i702, 'sharedProfile')
  i702.m_IsGlobal = !!i703[5]
  return i702
}

Deserializers["UnityEngine.EventSystems.EventSystem"] = function (request, data, root) {
  var i704 = root || request.c( 'UnityEngine.EventSystems.EventSystem' )
  var i705 = data
  request.r(i705[0], i705[1], 0, i704, 'm_FirstSelected')
  i704.m_sendNavigationEvents = !!i705[2]
  i704.m_DragThreshold = i705[3]
  return i704
}

Deserializers["UnityEngine.EventSystems.StandaloneInputModule"] = function (request, data, root) {
  var i706 = root || request.c( 'UnityEngine.EventSystems.StandaloneInputModule' )
  var i707 = data
  i706.m_HorizontalAxis = i707[0]
  i706.m_VerticalAxis = i707[1]
  i706.m_SubmitButton = i707[2]
  i706.m_CancelButton = i707[3]
  i706.m_InputActionsPerSecond = i707[4]
  i706.m_RepeatDelay = i707[5]
  i706.m_ForceModuleActive = !!i707[6]
  i706.m_SendPointerHoverToParent = !!i707[7]
  return i706
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Camera"] = function (request, data, root) {
  var i708 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Camera' )
  var i709 = data
  i708.aspect = i709[0]
  i708.orthographic = !!i709[1]
  i708.orthographicSize = i709[2]
  i708.backgroundColor = new pc.Color(i709[3], i709[4], i709[5], i709[6])
  i708.nearClipPlane = i709[7]
  i708.farClipPlane = i709[8]
  i708.fieldOfView = i709[9]
  i708.depth = i709[10]
  i708.clearFlags = i709[11]
  i708.cullingMask = i709[12]
  i708.rect = i709[13]
  request.r(i709[14], i709[15], 0, i708, 'targetTexture')
  i708.usePhysicalProperties = !!i709[16]
  i708.focalLength = i709[17]
  i708.sensorSize = new pc.Vec2( i709[18], i709[19] )
  i708.lensShift = new pc.Vec2( i709[20], i709[21] )
  i708.gateFit = i709[22]
  i708.commandBufferCount = i709[23]
  i708.cameraType = i709[24]
  i708.enabled = !!i709[25]
  return i708
}

Deserializers["UnityEngine.Rendering.Universal.UniversalAdditionalCameraData"] = function (request, data, root) {
  var i710 = root || request.c( 'UnityEngine.Rendering.Universal.UniversalAdditionalCameraData' )
  var i711 = data
  i710.m_RenderShadows = !!i711[0]
  i710.m_RequiresDepthTextureOption = i711[1]
  i710.m_RequiresOpaqueTextureOption = i711[2]
  i710.m_CameraType = i711[3]
  var i713 = i711[4]
  var i712 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Camera')))
  for(var i = 0; i < i713.length; i += 2) {
  request.r(i713[i + 0], i713[i + 1], 1, i712, '')
  }
  i710.m_Cameras = i712
  i710.m_RendererIndex = i711[5]
  i710.m_VolumeLayerMask = UnityEngine.LayerMask.FromIntegerValue( i711[6] )
  request.r(i711[7], i711[8], 0, i710, 'm_VolumeTrigger')
  i710.m_VolumeFrameworkUpdateModeOption = i711[9]
  i710.m_RenderPostProcessing = !!i711[10]
  i710.m_Antialiasing = i711[11]
  i710.m_AntialiasingQuality = i711[12]
  i710.m_StopNaN = !!i711[13]
  i710.m_Dithering = !!i711[14]
  i710.m_ClearDepth = !!i711[15]
  i710.m_AllowXRRendering = !!i711[16]
  i710.m_AllowHDROutput = !!i711[17]
  i710.m_UseScreenCoordOverride = !!i711[18]
  i710.m_ScreenSizeOverride = new pc.Vec4( i711[19], i711[20], i711[21], i711[22] )
  i710.m_ScreenCoordScaleBias = new pc.Vec4( i711[23], i711[24], i711[25], i711[26] )
  i710.m_RequiresDepthTexture = !!i711[27]
  i710.m_RequiresColorTexture = !!i711[28]
  i710.m_Version = i711[29]
  i710.m_TaaSettings = request.d('UnityEngine.Rendering.Universal.TemporalAA+Settings', i711[30], i710.m_TaaSettings)
  return i710
}

Deserializers["UnityEngine.Rendering.Universal.TemporalAA+Settings"] = function (request, data, root) {
  var i716 = root || request.c( 'UnityEngine.Rendering.Universal.TemporalAA+Settings' )
  var i717 = data
  i716.quality = i717[0]
  i716.frameInfluence = i717[1]
  i716.jitterScale = i717[2]
  i716.mipBias = i717[3]
  i716.varianceClampScale = i717[4]
  i716.contrastAdaptiveSharpening = i717[5]
  return i716
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshCollider"] = function (request, data, root) {
  var i718 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshCollider' )
  var i719 = data
  request.r(i719[0], i719[1], 0, i718, 'sharedMesh')
  i718.convex = !!i719[2]
  i718.enabled = !!i719[3]
  i718.isTrigger = !!i719[4]
  request.r(i719[5], i719[6], 0, i718, 'material')
  return i718
}

Deserializers["MarbleBoardGenerator"] = function (request, data, root) {
  var i720 = root || request.c( 'MarbleBoardGenerator' )
  var i721 = data
  request.r(i721[0], i721[1], 0, i720, 'levelData')
  request.r(i721[2], i721[3], 0, i720, 'marbleDatabase')
  request.r(i721[4], i721[5], 0, i720, 'wrongPromptImage')
  request.r(i721[6], i721[7], 0, i720, 'wrongPromptCanvas')
  var i723 = i721[8]
  var i722 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Transform')))
  for(var i = 0; i < i723.length; i += 2) {
  request.r(i723[i + 0], i723[i + 1], 1, i722, '')
  }
  i720.columnSpawnPoints = i722
  i720.zSpacing = i721[9]
  return i720
}

Deserializers["TrayGenerator"] = function (request, data, root) {
  var i726 = root || request.c( 'TrayGenerator' )
  var i727 = data
  request.r(i727[0], i727[1], 0, i726, 'levelData')
  request.r(i727[2], i727[3], 0, i726, 'trayDatabase')
  request.r(i727[4], i727[5], 0, i726, 'trayManager')
  request.r(i727[6], i727[7], 0, i726, 'spawnParent')
  request.r(i727[8], i727[9], 0, i726, 'spawnPoint')
  i726.offsetSpacing = new pc.Vec3( i727[10], i727[11], i727[12] )
  return i726
}

Deserializers["MarbleAnimationManager"] = function (request, data, root) {
  var i728 = root || request.c( 'MarbleAnimationManager' )
  var i729 = data
  i728.marbleRadius = i729[0]
  i728.moveSpeed = i729[1]
  i728.nudgeForward = i729[2]
  i728.maxSwerveBend = i729[3]
  i728.fullBendDistance = i729[4]
  i728.swerveEndZOffset = i729[5]
  i728.swerveArcCorrection = i729[6]
  i728.impactBounceHeight = i729[7]
  i728.bounceDurationFactor = i729[8]
  i728.rampArcCorrection = i729[9]
  i728.fallDistance = i729[10]
  i728.arcZDistance = i729[11]
  i728.fallDuration = i729[12]
  i728.arcZEase = i729[13]
  i728.arcYEase = i729[14]
  i728.fallBounceHeight = i729[15]
  i728.fallBounceDurationFactor = i729[16]
  return i728
}

Deserializers["TrayManager"] = function (request, data, root) {
  var i730 = root || request.c( 'TrayManager' )
  var i731 = data
  var i733 = i731[0]
  var i732 = new (System.Collections.Generic.List$1(Bridge.ns('Tray')))
  for(var i = 0; i < i733.length; i += 2) {
  request.r(i733[i + 0], i733[i + 1], 1, i732, '')
  }
  i730.trayCollection = i732
  request.r(i731[1], i731[2], 0, i730, 'currentTray')
  request.r(i731[3], i731[4], 0, i730, 'trayParent')
  i730.moveOffset = i731[5]
  i730.moveDuration = i731[6]
  i730.zSlideDuration = i731[7]
  i730.zExitTarget = i731[8]
  return i730
}

Deserializers["RampWaypoints"] = function (request, data, root) {
  var i736 = root || request.c( 'RampWaypoints' )
  var i737 = data
  var i739 = i737[0]
  var i738 = []
  for(var i = 0; i < i739.length; i += 2) {
  request.r(i739[i + 0], i739[i + 1], 2, i738, '')
  }
  i736.leftRailWaypoints = i738
  var i741 = i737[1]
  var i740 = []
  for(var i = 0; i < i741.length; i += 2) {
  request.r(i741[i + 0], i741[i + 1], 2, i740, '')
  }
  i736.rightRailWaypoints = i740
  return i736
}

Deserializers["MarbleIntroSpawner"] = function (request, data, root) {
  var i742 = root || request.c( 'MarbleIntroSpawner' )
  var i743 = data
  request.r(i743[0], i743[1], 0, i742, 'marbleDatabase')
  request.r(i743[2], i743[3], 0, i742, 'marbleIntroAnimation')
  request.r(i743[4], i743[5], 0, i742, 'marbleParent')
  i742.batchSize = i743[6]
  i742.batchInterval = i743[7]
  i742.batchCount = i743[8]
  i742.streamSpawnY = i743[9]
  i742.neckCentreX = i743[10]
  i742.streamSpawnZ = i743[11]
  i742.spawnRadius = i743[12]
  i742.neckFaceY = i743[13]
  i742.neckFallSpeed = i743[14]
  i742.neckBottomZ = i743[15]
  i742.spreadBeforePeakZ = i743[16]
  i742.flareWidth = i743[17]
  i742.flareTargetY = i743[18]
  i742.flareTargetZ = i743[19]
  i742.flarePeakDepth = i743[20]
  i742.rollingSpeed = i743[21]
  i742.rollingRadius = i743[22]
  i742.slotRadius = i743[23]
  i742.triangleBottomCount = i743[24]
  i742.triangleRowStep = i743[25]
  i742.overflowSideExtraX = i743[26]
  i742.overflowMiddleCollisionExtraX = i743[27]
  i742.overflowFallOvershootZ = i743[28]
  i742.newIntro = !!i743[29]
  i742.newIntroSpawnMinZ = i743[30]
  i742.newIntroSpawnMaxZ = i743[31]
  i742.newIntroSpawnMinX = i743[32]
  i742.newIntroSpawnMaxX = i743[33]
  i742.newIntroSpawnMinY = i743[34]
  i742.newIntroSpawnMaxY = i743[35]
  i742.newIntroLandY = i743[36]
  i742.newIntroMarbleCount = i743[37]
  i742.newIntroFallSpeed = i743[38]
  i742.newIntroRollDistance = i743[39]
  i742.newIntroRollDuration = i743[40]
  i742.newIntroSeed = i743[41]
  i742.newIntroFallbackRadius = i743[42]
  i742.newIntroMaxPlacementAttempts = i743[43]
  i742.newIntroBatchSize = i743[44]
  i742.newIntroBatchInterval = i743[45]
  i742.newIntroCompletionDelay = i743[46]
  return i742
}

Deserializers["MarbleIntroAnimation"] = function (request, data, root) {
  var i744 = root || request.c( 'MarbleIntroAnimation' )
  var i745 = data
  request.r(i745[0], i745[1], 0, i744, 'introCamera')
  i744.cameraPanTargetPosition = new pc.Vec3( i745[2], i745[3], i745[4] )
  i744.cameraPanTargetRotation = new pc.Vec3( i745[5], i745[6], i745[7] )
  i744.cameraPanDuration = i745[8]
  i744.cameraPanDelay = i745[9]
  i744.cameraPanEase = i745[10]
  i744.cameraPanTargetFOV = i745[11]
  return i744
}

Deserializers["CTAManager"] = function (request, data, root) {
  var i746 = root || request.c( 'CTAManager' )
  var i747 = data
  i746.iosLink = i747[0]
  i746.androidLink = i747[1]
  return i746
}

Deserializers["EndCardManager"] = function (request, data, root) {
  var i748 = root || request.c( 'EndCardManager' )
  var i749 = data
  request.r(i749[0], i749[1], 0, i748, 'uiCanvasGroup')
  request.r(i749[2], i749[3], 0, i748, 'bgCanvasGroup')
  request.r(i749[4], i749[5], 0, i748, 'playButtonRect')
  request.r(i749[6], i749[7], 0, i748, 'rotatingRect')
  i748.fadeDuration = i749[8]
  i748.fadeEase = i749[9]
  i748.scaleMultiplier = i749[10]
  i748.scaleDuration = i749[11]
  i748.scaleEase = i749[12]
  i748.rotationAmount = i749[13]
  i748.rotationDuration = i749[14]
  i748.rotationEase = i749[15]
  var i751 = i749[16]
  var i750 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.GameObject')))
  for(var i = 0; i < i751.length; i += 2) {
  request.r(i751[i + 0], i751[i + 1], 1, i750, '')
  }
  i748.turnOff = i750
  return i748
}

Deserializers["TutorialManager"] = function (request, data, root) {
  var i754 = root || request.c( 'TutorialManager' )
  var i755 = data
  request.r(i755[0], i755[1], 0, i754, 'handRect')
  request.r(i755[2], i755[3], 0, i754, 'handCanvasGroup')
  request.r(i755[4], i755[5], 0, i754, 'overlayCanvas')
  i754.idleTimeout = i755[6]
  i754.fadeDuration = i755[7]
  i754.handOffset = new pc.Vec2( i755[8], i755[9] )
  i754.pulseMinScale = i755[10]
  i754.pulseMaxScale = i755[11]
  i754.pulseDuration = i755[12]
  return i754
}

Deserializers["AudioManager"] = function (request, data, root) {
  var i756 = root || request.c( 'AudioManager' )
  var i757 = data
  request.r(i757[0], i757[1], 0, i756, 'library')
  i756.sfxPoolSize = i757[2]
  return i756
}

Deserializers["MarbleColumn"] = function (request, data, root) {
  var i758 = root || request.c( 'MarbleColumn' )
  var i759 = data
  request.r(i759[0], i759[1], 0, i758, 'leftNeighbor')
  request.r(i759[2], i759[3], 0, i758, 'rightNeighbor')
  return i758
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.RectTransform"] = function (request, data, root) {
  var i760 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.RectTransform' )
  var i761 = data
  i760.pivot = new pc.Vec2( i761[0], i761[1] )
  i760.anchorMin = new pc.Vec2( i761[2], i761[3] )
  i760.anchorMax = new pc.Vec2( i761[4], i761[5] )
  i760.sizeDelta = new pc.Vec2( i761[6], i761[7] )
  i760.anchoredPosition3D = new pc.Vec3( i761[8], i761[9], i761[10] )
  i760.rotation = new pc.Quat(i761[11], i761[12], i761[13], i761[14])
  i760.scale = new pc.Vec3( i761[15], i761[16], i761[17] )
  return i760
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Canvas"] = function (request, data, root) {
  var i762 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Canvas' )
  var i763 = data
  i762.planeDistance = i763[0]
  i762.referencePixelsPerUnit = i763[1]
  i762.isFallbackOverlay = !!i763[2]
  i762.renderMode = i763[3]
  i762.renderOrder = i763[4]
  i762.sortingLayerName = i763[5]
  i762.sortingOrder = i763[6]
  i762.scaleFactor = i763[7]
  request.r(i763[8], i763[9], 0, i762, 'worldCamera')
  i762.overrideSorting = !!i763[10]
  i762.pixelPerfect = !!i763[11]
  i762.targetDisplay = i763[12]
  i762.overridePixelPerfect = !!i763[13]
  i762.enabled = !!i763[14]
  return i762
}

Deserializers["UnityEngine.UI.CanvasScaler"] = function (request, data, root) {
  var i764 = root || request.c( 'UnityEngine.UI.CanvasScaler' )
  var i765 = data
  i764.m_UiScaleMode = i765[0]
  i764.m_ReferencePixelsPerUnit = i765[1]
  i764.m_ScaleFactor = i765[2]
  i764.m_ReferenceResolution = new pc.Vec2( i765[3], i765[4] )
  i764.m_ScreenMatchMode = i765[5]
  i764.m_MatchWidthOrHeight = i765[6]
  i764.m_PhysicalUnit = i765[7]
  i764.m_FallbackScreenDPI = i765[8]
  i764.m_DefaultSpriteDPI = i765[9]
  i764.m_DynamicPixelsPerUnit = i765[10]
  i764.m_PresetInfoIsWorld = !!i765[11]
  return i764
}

Deserializers["UnityEngine.UI.GraphicRaycaster"] = function (request, data, root) {
  var i766 = root || request.c( 'UnityEngine.UI.GraphicRaycaster' )
  var i767 = data
  i766.m_IgnoreReversedGraphics = !!i767[0]
  i766.m_BlockingObjects = i767[1]
  i766.m_BlockingMask = UnityEngine.LayerMask.FromIntegerValue( i767[2] )
  return i766
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer"] = function (request, data, root) {
  var i768 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer' )
  var i769 = data
  i768.cullTransparentMesh = !!i769[0]
  return i768
}

Deserializers["UnityEngine.UI.Image"] = function (request, data, root) {
  var i770 = root || request.c( 'UnityEngine.UI.Image' )
  var i771 = data
  request.r(i771[0], i771[1], 0, i770, 'm_Sprite')
  i770.m_Type = i771[2]
  i770.m_PreserveAspect = !!i771[3]
  i770.m_FillCenter = !!i771[4]
  i770.m_FillMethod = i771[5]
  i770.m_FillAmount = i771[6]
  i770.m_FillClockwise = !!i771[7]
  i770.m_FillOrigin = i771[8]
  i770.m_UseSpriteMesh = !!i771[9]
  i770.m_PixelsPerUnitMultiplier = i771[10]
  request.r(i771[11], i771[12], 0, i770, 'm_Material')
  i770.m_Maskable = !!i771[13]
  i770.m_Color = new pc.Color(i771[14], i771[15], i771[16], i771[17])
  i770.m_RaycastTarget = !!i771[18]
  i770.m_RaycastPadding = new pc.Vec4( i771[19], i771[20], i771[21], i771[22] )
  return i770
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasGroup"] = function (request, data, root) {
  var i772 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasGroup' )
  var i773 = data
  i772.m_Alpha = i773[0]
  i772.m_Interactable = !!i773[1]
  i772.m_BlocksRaycasts = !!i773[2]
  i772.m_IgnoreParentGroups = !!i773[3]
  i772.enabled = !!i773[4]
  return i772
}

Deserializers["UnityEngine.UI.Button"] = function (request, data, root) {
  var i774 = root || request.c( 'UnityEngine.UI.Button' )
  var i775 = data
  i774.m_OnClick = request.d('UnityEngine.UI.Button+ButtonClickedEvent', i775[0], i774.m_OnClick)
  i774.m_Navigation = request.d('UnityEngine.UI.Navigation', i775[1], i774.m_Navigation)
  i774.m_Transition = i775[2]
  i774.m_Colors = request.d('UnityEngine.UI.ColorBlock', i775[3], i774.m_Colors)
  i774.m_SpriteState = request.d('UnityEngine.UI.SpriteState', i775[4], i774.m_SpriteState)
  i774.m_AnimationTriggers = request.d('UnityEngine.UI.AnimationTriggers', i775[5], i774.m_AnimationTriggers)
  i774.m_Interactable = !!i775[6]
  request.r(i775[7], i775[8], 0, i774, 'm_TargetGraphic')
  return i774
}

Deserializers["UnityEngine.UI.Button+ButtonClickedEvent"] = function (request, data, root) {
  var i776 = root || request.c( 'UnityEngine.UI.Button+ButtonClickedEvent' )
  var i777 = data
  i776.m_PersistentCalls = request.d('UnityEngine.Events.PersistentCallGroup', i777[0], i776.m_PersistentCalls)
  return i776
}

Deserializers["UnityEngine.Events.PersistentCallGroup"] = function (request, data, root) {
  var i778 = root || request.c( 'UnityEngine.Events.PersistentCallGroup' )
  var i779 = data
  var i781 = i779[0]
  var i780 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Events.PersistentCall')))
  for(var i = 0; i < i781.length; i += 1) {
    i780.add(request.d('UnityEngine.Events.PersistentCall', i781[i + 0]));
  }
  i778.m_Calls = i780
  return i778
}

Deserializers["UnityEngine.Events.PersistentCall"] = function (request, data, root) {
  var i784 = root || request.c( 'UnityEngine.Events.PersistentCall' )
  var i785 = data
  request.r(i785[0], i785[1], 0, i784, 'm_Target')
  i784.m_TargetAssemblyTypeName = i785[2]
  i784.m_MethodName = i785[3]
  i784.m_Mode = i785[4]
  i784.m_Arguments = request.d('UnityEngine.Events.ArgumentCache', i785[5], i784.m_Arguments)
  i784.m_CallState = i785[6]
  return i784
}

Deserializers["UnityEngine.Events.ArgumentCache"] = function (request, data, root) {
  var i786 = root || request.c( 'UnityEngine.Events.ArgumentCache' )
  var i787 = data
  request.r(i787[0], i787[1], 0, i786, 'm_ObjectArgument')
  i786.m_ObjectArgumentAssemblyTypeName = i787[2]
  i786.m_IntArgument = i787[3]
  i786.m_FloatArgument = i787[4]
  i786.m_StringArgument = i787[5]
  i786.m_BoolArgument = !!i787[6]
  return i786
}

Deserializers["UnityEngine.UI.Navigation"] = function (request, data, root) {
  var i788 = root || request.c( 'UnityEngine.UI.Navigation' )
  var i789 = data
  i788.m_Mode = i789[0]
  i788.m_WrapAround = !!i789[1]
  request.r(i789[2], i789[3], 0, i788, 'm_SelectOnUp')
  request.r(i789[4], i789[5], 0, i788, 'm_SelectOnDown')
  request.r(i789[6], i789[7], 0, i788, 'm_SelectOnLeft')
  request.r(i789[8], i789[9], 0, i788, 'm_SelectOnRight')
  return i788
}

Deserializers["UnityEngine.UI.ColorBlock"] = function (request, data, root) {
  var i790 = root || request.c( 'UnityEngine.UI.ColorBlock' )
  var i791 = data
  i790.m_NormalColor = new pc.Color(i791[0], i791[1], i791[2], i791[3])
  i790.m_HighlightedColor = new pc.Color(i791[4], i791[5], i791[6], i791[7])
  i790.m_PressedColor = new pc.Color(i791[8], i791[9], i791[10], i791[11])
  i790.m_SelectedColor = new pc.Color(i791[12], i791[13], i791[14], i791[15])
  i790.m_DisabledColor = new pc.Color(i791[16], i791[17], i791[18], i791[19])
  i790.m_ColorMultiplier = i791[20]
  i790.m_FadeDuration = i791[21]
  return i790
}

Deserializers["UnityEngine.UI.SpriteState"] = function (request, data, root) {
  var i792 = root || request.c( 'UnityEngine.UI.SpriteState' )
  var i793 = data
  request.r(i793[0], i793[1], 0, i792, 'm_HighlightedSprite')
  request.r(i793[2], i793[3], 0, i792, 'm_PressedSprite')
  request.r(i793[4], i793[5], 0, i792, 'm_SelectedSprite')
  request.r(i793[6], i793[7], 0, i792, 'm_DisabledSprite')
  return i792
}

Deserializers["UnityEngine.UI.AnimationTriggers"] = function (request, data, root) {
  var i794 = root || request.c( 'UnityEngine.UI.AnimationTriggers' )
  var i795 = data
  i794.m_NormalTrigger = i795[0]
  i794.m_HighlightedTrigger = i795[1]
  i794.m_PressedTrigger = i795[2]
  i794.m_SelectedTrigger = i795[3]
  i794.m_DisabledTrigger = i795[4]
  return i794
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings"] = function (request, data, root) {
  var i796 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings' )
  var i797 = data
  i796.ambientIntensity = i797[0]
  i796.reflectionIntensity = i797[1]
  i796.ambientMode = i797[2]
  i796.ambientLight = new pc.Color(i797[3], i797[4], i797[5], i797[6])
  i796.ambientSkyColor = new pc.Color(i797[7], i797[8], i797[9], i797[10])
  i796.ambientGroundColor = new pc.Color(i797[11], i797[12], i797[13], i797[14])
  i796.ambientEquatorColor = new pc.Color(i797[15], i797[16], i797[17], i797[18])
  i796.fogColor = new pc.Color(i797[19], i797[20], i797[21], i797[22])
  i796.fogEndDistance = i797[23]
  i796.fogStartDistance = i797[24]
  i796.fogDensity = i797[25]
  i796.fog = !!i797[26]
  request.r(i797[27], i797[28], 0, i796, 'skybox')
  i796.fogMode = i797[29]
  var i799 = i797[30]
  var i798 = []
  for(var i = 0; i < i799.length; i += 1) {
    i798.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap', i799[i + 0]) );
  }
  i796.lightmaps = i798
  i796.lightProbes = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes', i797[31], i796.lightProbes)
  i796.lightmapsMode = i797[32]
  i796.mixedBakeMode = i797[33]
  i796.environmentLightingMode = i797[34]
  i796.ambientProbe = new pc.SphericalHarmonicsL2(i797[35])
  request.r(i797[36], i797[37], 0, i796, 'customReflection')
  request.r(i797[38], i797[39], 0, i796, 'defaultReflection')
  i796.defaultReflectionMode = i797[40]
  i796.defaultReflectionResolution = i797[41]
  i796.sunLightObjectId = i797[42]
  i796.pixelLightCount = i797[43]
  i796.defaultReflectionHDR = !!i797[44]
  i796.hasLightDataAsset = !!i797[45]
  i796.hasManualGenerate = !!i797[46]
  return i796
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap"] = function (request, data, root) {
  var i802 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap' )
  var i803 = data
  request.r(i803[0], i803[1], 0, i802, 'lightmapColor')
  request.r(i803[2], i803[3], 0, i802, 'lightmapDirection')
  request.r(i803[4], i803[5], 0, i802, 'shadowMask')
  return i802
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes"] = function (request, data, root) {
  var i804 = root || new UnityEngine.LightProbes()
  var i805 = data
  return i804
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset"] = function (request, data, root) {
  var i812 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset' )
  var i813 = data
  i812.AdditionalLightsRenderingMode = i813[0]
  i812.LightRenderingMode = request.d('Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode', i813[1], i812.LightRenderingMode)
  i812.MainLightRenderingModeValue = i813[2]
  i812.SupportsMainLightShadows = !!i813[3]
  i812.MixedLightingSupported = !!i813[4]
  i812.MainLightShadowmapResolutionValue = i813[5]
  i812.SupportsSoftShadows = !!i813[6]
  i812.SoftShadowQualityValue = i813[7]
  i812.ShadowDistance = i813[8]
  i812.ShadowCascadeCount = i813[9]
  i812.Cascade2Split = i813[10]
  i812.Cascade3Split = new pc.Vec2( i813[11], i813[12] )
  i812.Cascade4Split = new pc.Vec3( i813[13], i813[14], i813[15] )
  i812.CascadeBorder = i813[16]
  i812.ShadowDepthBias = i813[17]
  i812.ShadowNormalBias = i813[18]
  i812.RequireDepthTexture = !!i813[19]
  i812.RequireOpaqueTexture = !!i813[20]
  i812.scriptableRendererData = request.d('Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData', i813[21], i812.scriptableRendererData)
  return i812
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode"] = function (request, data, root) {
  var i814 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode' )
  var i815 = data
  i814.Disabled = i815[0]
  i814.PerVertex = i815[1]
  i814.PerPixel = i815[2]
  return i814
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData"] = function (request, data, root) {
  var i816 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData' )
  var i817 = data
  i816.opaqueLayerMask = i817[0]
  i816.transparentLayerMask = i817[1]
  var i819 = i817[2]
  var i818 = []
  for(var i = 0; i < i819.length; i += 1) {
    i818.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects', i819[i + 0]) );
  }
  i816.RenderObjectsFeatures = i818
  i816.name = i817[3]
  return i816
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects"] = function (request, data, root) {
  var i822 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects' )
  var i823 = data
  i822.settings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings', i823[0], i822.settings)
  i822.name = i823[1]
  i822.typeName = i823[2]
  return i822
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader"] = function (request, data, root) {
  var i824 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader' )
  var i825 = data
  var i827 = i825[0]
  var i826 = new (System.Collections.Generic.List$1(Bridge.ns('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError')))
  for(var i = 0; i < i827.length; i += 1) {
    i826.add(request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError', i827[i + 0]));
  }
  i824.ShaderCompilationErrors = i826
  i824.name = i825[1]
  i824.guid = i825[2]
  var i829 = i825[3]
  var i828 = []
  for(var i = 0; i < i829.length; i += 1) {
    i828.push( i829[i + 0] );
  }
  i824.shaderDefinedKeywords = i828
  var i831 = i825[4]
  var i830 = []
  for(var i = 0; i < i831.length; i += 1) {
    i830.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass', i831[i + 0]) );
  }
  i824.passes = i830
  var i833 = i825[5]
  var i832 = []
  for(var i = 0; i < i833.length; i += 1) {
    i832.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass', i833[i + 0]) );
  }
  i824.usePasses = i832
  var i835 = i825[6]
  var i834 = []
  for(var i = 0; i < i835.length; i += 1) {
    i834.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue', i835[i + 0]) );
  }
  i824.defaultParameterValues = i834
  request.r(i825[7], i825[8], 0, i824, 'unityFallbackShader')
  i824.readDepth = !!i825[9]
  i824.hasDepthOnlyPass = !!i825[10]
  i824.isCreatedByShaderGraph = !!i825[11]
  i824.disableBatching = !!i825[12]
  i824.compiled = !!i825[13]
  return i824
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError"] = function (request, data, root) {
  var i838 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError' )
  var i839 = data
  i838.shaderName = i839[0]
  i838.errorMessage = i839[1]
  return i838
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass"] = function (request, data, root) {
  var i844 = root || new pc.UnityShaderPass()
  var i845 = data
  i844.id = i845[0]
  i844.subShaderIndex = i845[1]
  i844.name = i845[2]
  i844.passType = i845[3]
  i844.grabPassTextureName = i845[4]
  i844.usePass = !!i845[5]
  i844.zTest = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[6], i844.zTest)
  i844.zWrite = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[7], i844.zWrite)
  i844.culling = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[8], i844.culling)
  i844.blending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i845[9], i844.blending)
  i844.alphaBlending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i845[10], i844.alphaBlending)
  i844.colorWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[11], i844.colorWriteMask)
  i844.offsetUnits = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[12], i844.offsetUnits)
  i844.offsetFactor = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[13], i844.offsetFactor)
  i844.stencilRef = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[14], i844.stencilRef)
  i844.stencilReadMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[15], i844.stencilReadMask)
  i844.stencilWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i845[16], i844.stencilWriteMask)
  i844.stencilOp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i845[17], i844.stencilOp)
  i844.stencilOpFront = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i845[18], i844.stencilOpFront)
  i844.stencilOpBack = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i845[19], i844.stencilOpBack)
  var i847 = i845[20]
  var i846 = []
  for(var i = 0; i < i847.length; i += 1) {
    i846.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag', i847[i + 0]) );
  }
  i844.tags = i846
  var i849 = i845[21]
  var i848 = []
  for(var i = 0; i < i849.length; i += 1) {
    i848.push( i849[i + 0] );
  }
  i844.passDefinedKeywords = i848
  var i851 = i845[22]
  var i850 = []
  for(var i = 0; i < i851.length; i += 1) {
    i850.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup', i851[i + 0]) );
  }
  i844.passDefinedKeywordGroups = i850
  var i853 = i845[23]
  var i852 = []
  for(var i = 0; i < i853.length; i += 1) {
    i852.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i853[i + 0]) );
  }
  i844.variants = i852
  var i855 = i845[24]
  var i854 = []
  for(var i = 0; i < i855.length; i += 1) {
    i854.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i855[i + 0]) );
  }
  i844.excludedVariants = i854
  i844.hasDepthReader = !!i845[25]
  return i844
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value"] = function (request, data, root) {
  var i856 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value' )
  var i857 = data
  i856.val = i857[0]
  i856.name = i857[1]
  return i856
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending"] = function (request, data, root) {
  var i858 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending' )
  var i859 = data
  i858.src = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i859[0], i858.src)
  i858.dst = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i859[1], i858.dst)
  i858.op = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i859[2], i858.op)
  return i858
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp"] = function (request, data, root) {
  var i860 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp' )
  var i861 = data
  i860.pass = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i861[0], i860.pass)
  i860.fail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i861[1], i860.fail)
  i860.zFail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i861[2], i860.zFail)
  i860.comp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i861[3], i860.comp)
  return i860
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag"] = function (request, data, root) {
  var i864 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag' )
  var i865 = data
  i864.name = i865[0]
  i864.value = i865[1]
  return i864
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup"] = function (request, data, root) {
  var i868 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup' )
  var i869 = data
  var i871 = i869[0]
  var i870 = []
  for(var i = 0; i < i871.length; i += 1) {
    i870.push( i871[i + 0] );
  }
  i868.keywords = i870
  i868.hasDiscard = !!i869[1]
  return i868
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant"] = function (request, data, root) {
  var i874 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant' )
  var i875 = data
  i874.passId = i875[0]
  i874.subShaderIndex = i875[1]
  var i877 = i875[2]
  var i876 = []
  for(var i = 0; i < i877.length; i += 1) {
    i876.push( i877[i + 0] );
  }
  i874.keywords = i876
  i874.vertexProgram = i875[3]
  i874.fragmentProgram = i875[4]
  i874.exportedForWebGl2 = !!i875[5]
  i874.readDepth = !!i875[6]
  return i874
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass"] = function (request, data, root) {
  var i880 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass' )
  var i881 = data
  request.r(i881[0], i881[1], 0, i880, 'shader')
  i880.pass = i881[2]
  return i880
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue"] = function (request, data, root) {
  var i884 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue' )
  var i885 = data
  i884.name = i885[0]
  i884.type = i885[1]
  i884.value = new pc.Vec4( i885[2], i885[3], i885[4], i885[5] )
  i884.textureValue = i885[6]
  i884.shaderPropertyFlag = i885[7]
  return i884
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Sprite"] = function (request, data, root) {
  var i886 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Sprite' )
  var i887 = data
  i886.name = i887[0]
  request.r(i887[1], i887[2], 0, i886, 'texture')
  i886.aabb = i887[3]
  i886.vertices = i887[4]
  i886.triangles = i887[5]
  i886.textureRect = UnityEngine.Rect.MinMaxRect(i887[6], i887[7], i887[8], i887[9])
  i886.packedRect = UnityEngine.Rect.MinMaxRect(i887[10], i887[11], i887[12], i887[13])
  i886.border = new pc.Vec4( i887[14], i887[15], i887[16], i887[17] )
  i886.transparency = i887[18]
  i886.bounds = i887[19]
  i886.pixelsPerUnit = i887[20]
  i886.textureWidth = i887[21]
  i886.textureHeight = i887[22]
  i886.nativeSize = new pc.Vec2( i887[23], i887[24] )
  i886.pivot = new pc.Vec2( i887[25], i887[26] )
  i886.textureRectOffset = new pc.Vec2( i887[27], i887[28] )
  return i886
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.AudioClip"] = function (request, data, root) {
  var i888 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.AudioClip' )
  var i889 = data
  i888.name = i889[0]
  return i888
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font"] = function (request, data, root) {
  var i890 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font' )
  var i891 = data
  i890.name = i891[0]
  i890.ascent = i891[1]
  i890.originalLineHeight = i891[2]
  i890.fontSize = i891[3]
  var i893 = i891[4]
  var i892 = []
  for(var i = 0; i < i893.length; i += 1) {
    i892.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo', i893[i + 0]) );
  }
  i890.characterInfo = i892
  request.r(i891[5], i891[6], 0, i890, 'texture')
  i890.originalFontSize = i891[7]
  return i890
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo"] = function (request, data, root) {
  var i896 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo' )
  var i897 = data
  i896.index = i897[0]
  i896.advance = i897[1]
  i896.bearing = i897[2]
  i896.glyphWidth = i897[3]
  i896.glyphHeight = i897[4]
  i896.minX = i897[5]
  i896.maxX = i897[6]
  i896.minY = i897[7]
  i896.maxY = i897[8]
  i896.uvBottomLeftX = i897[9]
  i896.uvBottomLeftY = i897[10]
  i896.uvBottomRightX = i897[11]
  i896.uvBottomRightY = i897[12]
  i896.uvTopLeftX = i897[13]
  i896.uvTopLeftY = i897[14]
  i896.uvTopRightX = i897[15]
  i896.uvTopRightY = i897[16]
  return i896
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.TextAsset"] = function (request, data, root) {
  var i898 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.TextAsset' )
  var i899 = data
  i898.name = i899[0]
  i898.bytes64 = i899[1]
  i898.data = i899[2]
  return i898
}

Deserializers["UnityEngine.Rendering.VolumeProfile"] = function (request, data, root) {
  var i900 = root || request.c( 'UnityEngine.Rendering.VolumeProfile' )
  var i901 = data
  var i903 = i901[0]
  var i902 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Rendering.VolumeComponent')))
  for(var i = 0; i < i903.length; i += 2) {
  request.r(i903[i + 0], i903[i + 1], 1, i902, '')
  }
  i900.components = i902
  return i900
}

Deserializers["UnityEngine.Rendering.Universal.Tonemapping"] = function (request, data, root) {
  var i906 = root || request.c( 'UnityEngine.Rendering.Universal.Tonemapping' )
  var i907 = data
  i906.mode = request.d('UnityEngine.Rendering.Universal.TonemappingModeParameter', i907[0], i906.mode)
  i906.neutralHDRRangeReductionMode = request.d('UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter', i907[1], i906.neutralHDRRangeReductionMode)
  i906.acesPreset = request.d('UnityEngine.Rendering.Universal.HDRACESPresetParameter', i907[2], i906.acesPreset)
  i906.hueShiftAmount = request.d('UnityEngine.Rendering.ClampedFloatParameter', i907[3], i906.hueShiftAmount)
  i906.detectPaperWhite = request.d('UnityEngine.Rendering.BoolParameter', i907[4], i906.detectPaperWhite)
  i906.paperWhite = request.d('UnityEngine.Rendering.ClampedFloatParameter', i907[5], i906.paperWhite)
  i906.detectBrightnessLimits = request.d('UnityEngine.Rendering.BoolParameter', i907[6], i906.detectBrightnessLimits)
  i906.minNits = request.d('UnityEngine.Rendering.ClampedFloatParameter', i907[7], i906.minNits)
  i906.maxNits = request.d('UnityEngine.Rendering.ClampedFloatParameter', i907[8], i906.maxNits)
  i906.active = !!i907[9]
  return i906
}

Deserializers["UnityEngine.Rendering.Universal.TonemappingModeParameter"] = function (request, data, root) {
  var i908 = root || request.c( 'UnityEngine.Rendering.Universal.TonemappingModeParameter' )
  var i909 = data
  i908.m_Value = i909[0]
  i908.m_OverrideState = !!i909[1]
  return i908
}

Deserializers["UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter"] = function (request, data, root) {
  var i910 = root || request.c( 'UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter' )
  var i911 = data
  i910.m_Value = i911[0]
  i910.m_OverrideState = !!i911[1]
  return i910
}

Deserializers["UnityEngine.Rendering.Universal.HDRACESPresetParameter"] = function (request, data, root) {
  var i912 = root || request.c( 'UnityEngine.Rendering.Universal.HDRACESPresetParameter' )
  var i913 = data
  i912.m_Value = i913[0]
  i912.m_OverrideState = !!i913[1]
  return i912
}

Deserializers["UnityEngine.Rendering.ClampedFloatParameter"] = function (request, data, root) {
  var i914 = root || request.c( 'UnityEngine.Rendering.ClampedFloatParameter' )
  var i915 = data
  i914.m_Value = i915[0]
  i914.m_OverrideState = !!i915[1]
  return i914
}

Deserializers["UnityEngine.Rendering.BoolParameter"] = function (request, data, root) {
  var i916 = root || request.c( 'UnityEngine.Rendering.BoolParameter' )
  var i917 = data
  i916.m_Value = !!i917[0]
  i916.m_OverrideState = !!i917[1]
  return i916
}

Deserializers["UnityEngine.Rendering.Universal.Bloom"] = function (request, data, root) {
  var i918 = root || request.c( 'UnityEngine.Rendering.Universal.Bloom' )
  var i919 = data
  i918.skipIterations = request.d('UnityEngine.Rendering.ClampedIntParameter', i919[0], i918.skipIterations)
  i918.threshold = request.d('UnityEngine.Rendering.MinFloatParameter', i919[1], i918.threshold)
  i918.intensity = request.d('UnityEngine.Rendering.MinFloatParameter', i919[2], i918.intensity)
  i918.scatter = request.d('UnityEngine.Rendering.ClampedFloatParameter', i919[3], i918.scatter)
  i918.clamp = request.d('UnityEngine.Rendering.MinFloatParameter', i919[4], i918.clamp)
  i918.tint = request.d('UnityEngine.Rendering.ColorParameter', i919[5], i918.tint)
  i918.highQualityFiltering = request.d('UnityEngine.Rendering.BoolParameter', i919[6], i918.highQualityFiltering)
  i918.downscale = request.d('UnityEngine.Rendering.Universal.DownscaleParameter', i919[7], i918.downscale)
  i918.maxIterations = request.d('UnityEngine.Rendering.ClampedIntParameter', i919[8], i918.maxIterations)
  i918.dirtTexture = request.d('UnityEngine.Rendering.TextureParameter', i919[9], i918.dirtTexture)
  i918.dirtIntensity = request.d('UnityEngine.Rendering.MinFloatParameter', i919[10], i918.dirtIntensity)
  i918.active = !!i919[11]
  return i918
}

Deserializers["UnityEngine.Rendering.ClampedIntParameter"] = function (request, data, root) {
  var i920 = root || request.c( 'UnityEngine.Rendering.ClampedIntParameter' )
  var i921 = data
  i920.m_Value = i921[0]
  i920.m_OverrideState = !!i921[1]
  return i920
}

Deserializers["UnityEngine.Rendering.MinFloatParameter"] = function (request, data, root) {
  var i922 = root || request.c( 'UnityEngine.Rendering.MinFloatParameter' )
  var i923 = data
  i922.m_Value = i923[0]
  i922.m_OverrideState = !!i923[1]
  return i922
}

Deserializers["UnityEngine.Rendering.ColorParameter"] = function (request, data, root) {
  var i924 = root || request.c( 'UnityEngine.Rendering.ColorParameter' )
  var i925 = data
  i924.m_Value = new pc.Color(i925[0], i925[1], i925[2], i925[3])
  i924.m_OverrideState = !!i925[4]
  return i924
}

Deserializers["UnityEngine.Rendering.Universal.DownscaleParameter"] = function (request, data, root) {
  var i926 = root || request.c( 'UnityEngine.Rendering.Universal.DownscaleParameter' )
  var i927 = data
  i926.m_Value = i927[0]
  i926.m_OverrideState = !!i927[1]
  return i926
}

Deserializers["UnityEngine.Rendering.TextureParameter"] = function (request, data, root) {
  var i928 = root || request.c( 'UnityEngine.Rendering.TextureParameter' )
  var i929 = data
  i928.dimension = i929[0]
  request.r(i929[1], i929[2], 0, i928, 'm_Value')
  i928.m_OverrideState = !!i929[3]
  return i928
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlur"] = function (request, data, root) {
  var i930 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlur' )
  var i931 = data
  i930.mode = request.d('UnityEngine.Rendering.Universal.MotionBlurModeParameter', i931[0], i930.mode)
  i930.quality = request.d('UnityEngine.Rendering.Universal.MotionBlurQualityParameter', i931[1], i930.quality)
  i930.intensity = request.d('UnityEngine.Rendering.ClampedFloatParameter', i931[2], i930.intensity)
  i930.clamp = request.d('UnityEngine.Rendering.ClampedFloatParameter', i931[3], i930.clamp)
  i930.active = !!i931[4]
  return i930
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlurModeParameter"] = function (request, data, root) {
  var i932 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlurModeParameter' )
  var i933 = data
  i932.m_Value = i933[0]
  i932.m_OverrideState = !!i933[1]
  return i932
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlurQualityParameter"] = function (request, data, root) {
  var i934 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlurQualityParameter' )
  var i935 = data
  i934.m_Value = i935[0]
  i934.m_OverrideState = !!i935[1]
  return i934
}

Deserializers["UnityEngine.Rendering.Universal.Vignette"] = function (request, data, root) {
  var i936 = root || request.c( 'UnityEngine.Rendering.Universal.Vignette' )
  var i937 = data
  i936.color = request.d('UnityEngine.Rendering.ColorParameter', i937[0], i936.color)
  i936.center = request.d('UnityEngine.Rendering.Vector2Parameter', i937[1], i936.center)
  i936.intensity = request.d('UnityEngine.Rendering.ClampedFloatParameter', i937[2], i936.intensity)
  i936.smoothness = request.d('UnityEngine.Rendering.ClampedFloatParameter', i937[3], i936.smoothness)
  i936.rounded = request.d('UnityEngine.Rendering.BoolParameter', i937[4], i936.rounded)
  i936.active = !!i937[5]
  return i936
}

Deserializers["UnityEngine.Rendering.Vector2Parameter"] = function (request, data, root) {
  var i938 = root || request.c( 'UnityEngine.Rendering.Vector2Parameter' )
  var i939 = data
  i938.m_Value = new pc.Vec2( i939[0], i939[1] )
  i938.m_OverrideState = !!i939[2]
  return i938
}

Deserializers["MarbleLevelData"] = function (request, data, root) {
  var i940 = root || request.c( 'MarbleLevelData' )
  var i941 = data
  var i943 = i941[0]
  var i942 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleLevelData+ColumnData')))
  for(var i = 0; i < i943.length; i += 1) {
    i942.add(request.d('MarbleLevelData+ColumnData', i943[i + 0]));
  }
  i940.columns = i942
  return i940
}

Deserializers["MarbleLevelData+ColumnData"] = function (request, data, root) {
  var i946 = root || request.c( 'MarbleLevelData+ColumnData' )
  var i947 = data
  var i949 = i947[0]
  var i948 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleType')))
  for(var i = 0; i < i949.length; i += 1) {
    i948.add(i949[i + 0]);
  }
  i946.marbles = i948
  return i946
}

Deserializers["MarbleDatabase"] = function (request, data, root) {
  var i952 = root || request.c( 'MarbleDatabase' )
  var i953 = data
  var i955 = i953[0]
  var i954 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleDatabase+MarblePrefabEntry')))
  for(var i = 0; i < i955.length; i += 1) {
    i954.add(request.d('MarbleDatabase+MarblePrefabEntry', i955[i + 0]));
  }
  i952.entries = i954
  return i952
}

Deserializers["MarbleDatabase+MarblePrefabEntry"] = function (request, data, root) {
  var i958 = root || request.c( 'MarbleDatabase+MarblePrefabEntry' )
  var i959 = data
  i958.type = i959[0]
  request.r(i959[1], i959[2], 0, i958, 'prefab')
  return i958
}

Deserializers["TrayLevelData"] = function (request, data, root) {
  var i960 = root || request.c( 'TrayLevelData' )
  var i961 = data
  var i963 = i961[0]
  var i962 = new (System.Collections.Generic.List$1(Bridge.ns('TrayType')))
  for(var i = 0; i < i963.length; i += 1) {
    i962.add(i963[i + 0]);
  }
  i960.trays = i962
  return i960
}

Deserializers["TrayDatabase"] = function (request, data, root) {
  var i966 = root || request.c( 'TrayDatabase' )
  var i967 = data
  var i969 = i967[0]
  var i968 = new (System.Collections.Generic.List$1(Bridge.ns('TrayDatabase+TrayPrefabEntry')))
  for(var i = 0; i < i969.length; i += 1) {
    i968.add(request.d('TrayDatabase+TrayPrefabEntry', i969[i + 0]));
  }
  i966.entries = i968
  return i966
}

Deserializers["TrayDatabase+TrayPrefabEntry"] = function (request, data, root) {
  var i972 = root || request.c( 'TrayDatabase+TrayPrefabEntry' )
  var i973 = data
  i972.type = i973[0]
  request.r(i973[1], i973[2], 0, i972, 'prefab')
  return i972
}

Deserializers["AudioLibrary"] = function (request, data, root) {
  var i974 = root || request.c( 'AudioLibrary' )
  var i975 = data
  var i977 = i975[0]
  var i976 = new (System.Collections.Generic.List$1(Bridge.ns('AudioLibrary+ClipEntry')))
  for(var i = 0; i < i977.length; i += 1) {
    i976.add(request.d('AudioLibrary+ClipEntry', i977[i + 0]));
  }
  i974.clips = i976
  return i974
}

Deserializers["AudioLibrary+ClipEntry"] = function (request, data, root) {
  var i980 = root || request.c( 'AudioLibrary+ClipEntry' )
  var i981 = data
  i980.key = i981[0]
  i980.channel = i981[1]
  request.r(i981[2], i981[3], 0, i980, 'clip')
  i980.volume = i981[4]
  i980.loop = !!i981[5]
  return i980
}

Deserializers["DG.Tweening.Core.DOTweenSettings"] = function (request, data, root) {
  var i982 = root || request.c( 'DG.Tweening.Core.DOTweenSettings' )
  var i983 = data
  i982.useSafeMode = !!i983[0]
  i982.safeModeOptions = request.d('DG.Tweening.Core.DOTweenSettings+SafeModeOptions', i983[1], i982.safeModeOptions)
  i982.timeScale = i983[2]
  i982.unscaledTimeScale = i983[3]
  i982.useSmoothDeltaTime = !!i983[4]
  i982.maxSmoothUnscaledTime = i983[5]
  i982.rewindCallbackMode = i983[6]
  i982.showUnityEditorReport = !!i983[7]
  i982.logBehaviour = i983[8]
  i982.drawGizmos = !!i983[9]
  i982.defaultRecyclable = !!i983[10]
  i982.defaultAutoPlay = i983[11]
  i982.defaultUpdateType = i983[12]
  i982.defaultTimeScaleIndependent = !!i983[13]
  i982.defaultEaseType = i983[14]
  i982.defaultEaseOvershootOrAmplitude = i983[15]
  i982.defaultEasePeriod = i983[16]
  i982.defaultAutoKill = !!i983[17]
  i982.defaultLoopType = i983[18]
  i982.debugMode = !!i983[19]
  i982.debugStoreTargetId = !!i983[20]
  i982.showPreviewPanel = !!i983[21]
  i982.storeSettingsLocation = i983[22]
  i982.modules = request.d('DG.Tweening.Core.DOTweenSettings+ModulesSetup', i983[23], i982.modules)
  i982.createASMDEF = !!i983[24]
  i982.showPlayingTweens = !!i983[25]
  i982.showPausedTweens = !!i983[26]
  return i982
}

Deserializers["DG.Tweening.Core.DOTweenSettings+SafeModeOptions"] = function (request, data, root) {
  var i984 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+SafeModeOptions' )
  var i985 = data
  i984.logBehaviour = i985[0]
  i984.nestedTweenFailureBehaviour = i985[1]
  return i984
}

Deserializers["DG.Tweening.Core.DOTweenSettings+ModulesSetup"] = function (request, data, root) {
  var i986 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+ModulesSetup' )
  var i987 = data
  i986.showPanel = !!i987[0]
  i986.audioEnabled = !!i987[1]
  i986.physicsEnabled = !!i987[2]
  i986.physics2DEnabled = !!i987[3]
  i986.spriteEnabled = !!i987[4]
  i986.uiEnabled = !!i987[5]
  i986.textMeshProEnabled = !!i987[6]
  i986.tk2DEnabled = !!i987[7]
  i986.deAudioEnabled = !!i987[8]
  i986.deUnityExtendedEnabled = !!i987[9]
  i986.epoOutlineEnabled = !!i987[10]
  return i986
}

Deserializers["TMPro.TMP_Settings"] = function (request, data, root) {
  var i988 = root || request.c( 'TMPro.TMP_Settings' )
  var i989 = data
  i988.m_enableWordWrapping = !!i989[0]
  i988.m_enableKerning = !!i989[1]
  i988.m_enableExtraPadding = !!i989[2]
  i988.m_enableTintAllSprites = !!i989[3]
  i988.m_enableParseEscapeCharacters = !!i989[4]
  i988.m_EnableRaycastTarget = !!i989[5]
  i988.m_GetFontFeaturesAtRuntime = !!i989[6]
  i988.m_missingGlyphCharacter = i989[7]
  i988.m_warningsDisabled = !!i989[8]
  request.r(i989[9], i989[10], 0, i988, 'm_defaultFontAsset')
  i988.m_defaultFontAssetPath = i989[11]
  i988.m_defaultFontSize = i989[12]
  i988.m_defaultAutoSizeMinRatio = i989[13]
  i988.m_defaultAutoSizeMaxRatio = i989[14]
  i988.m_defaultTextMeshProTextContainerSize = new pc.Vec2( i989[15], i989[16] )
  i988.m_defaultTextMeshProUITextContainerSize = new pc.Vec2( i989[17], i989[18] )
  i988.m_autoSizeTextContainer = !!i989[19]
  i988.m_IsTextObjectScaleStatic = !!i989[20]
  var i991 = i989[21]
  var i990 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i991.length; i += 2) {
  request.r(i991[i + 0], i991[i + 1], 1, i990, '')
  }
  i988.m_fallbackFontAssets = i990
  i988.m_matchMaterialPreset = !!i989[22]
  request.r(i989[23], i989[24], 0, i988, 'm_defaultSpriteAsset')
  i988.m_defaultSpriteAssetPath = i989[25]
  i988.m_enableEmojiSupport = !!i989[26]
  i988.m_MissingCharacterSpriteUnicode = i989[27]
  i988.m_defaultColorGradientPresetsPath = i989[28]
  request.r(i989[29], i989[30], 0, i988, 'm_defaultStyleSheet')
  i988.m_StyleSheetsResourcePath = i989[31]
  request.r(i989[32], i989[33], 0, i988, 'm_leadingCharacters')
  request.r(i989[34], i989[35], 0, i988, 'm_followingCharacters')
  i988.m_UseModernHangulLineBreakingRules = !!i989[36]
  return i988
}

Deserializers["TMPro.TMP_FontAsset"] = function (request, data, root) {
  var i994 = root || request.c( 'TMPro.TMP_FontAsset' )
  var i995 = data
  request.r(i995[0], i995[1], 0, i994, 'atlas')
  i994.normalStyle = i995[2]
  i994.normalSpacingOffset = i995[3]
  i994.boldStyle = i995[4]
  i994.boldSpacing = i995[5]
  i994.italicStyle = i995[6]
  i994.tabSize = i995[7]
  i994.hashCode = i995[8]
  request.r(i995[9], i995[10], 0, i994, 'material')
  i994.materialHashCode = i995[11]
  i994.m_Version = i995[12]
  i994.m_SourceFontFileGUID = i995[13]
  request.r(i995[14], i995[15], 0, i994, 'm_SourceFontFile_EditorRef')
  request.r(i995[16], i995[17], 0, i994, 'm_SourceFontFile')
  i994.m_AtlasPopulationMode = i995[18]
  i994.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i995[19], i994.m_FaceInfo)
  var i997 = i995[20]
  var i996 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.Glyph')))
  for(var i = 0; i < i997.length; i += 1) {
    i996.add(request.d('UnityEngine.TextCore.Glyph', i997[i + 0]));
  }
  i994.m_GlyphTable = i996
  var i999 = i995[21]
  var i998 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Character')))
  for(var i = 0; i < i999.length; i += 1) {
    i998.add(request.d('TMPro.TMP_Character', i999[i + 0]));
  }
  i994.m_CharacterTable = i998
  var i1001 = i995[22]
  var i1000 = []
  for(var i = 0; i < i1001.length; i += 2) {
  request.r(i1001[i + 0], i1001[i + 1], 2, i1000, '')
  }
  i994.m_AtlasTextures = i1000
  i994.m_AtlasTextureIndex = i995[23]
  i994.m_IsMultiAtlasTexturesEnabled = !!i995[24]
  i994.m_ClearDynamicDataOnBuild = !!i995[25]
  var i1003 = i995[26]
  var i1002 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i1003.length; i += 1) {
    i1002.add(request.d('UnityEngine.TextCore.GlyphRect', i1003[i + 0]));
  }
  i994.m_UsedGlyphRects = i1002
  var i1005 = i995[27]
  var i1004 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i1005.length; i += 1) {
    i1004.add(request.d('UnityEngine.TextCore.GlyphRect', i1005[i + 0]));
  }
  i994.m_FreeGlyphRects = i1004
  i994.m_fontInfo = request.d('TMPro.FaceInfo_Legacy', i995[28], i994.m_fontInfo)
  i994.m_AtlasWidth = i995[29]
  i994.m_AtlasHeight = i995[30]
  i994.m_AtlasPadding = i995[31]
  i994.m_AtlasRenderMode = i995[32]
  var i1007 = i995[33]
  var i1006 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Glyph')))
  for(var i = 0; i < i1007.length; i += 1) {
    i1006.add(request.d('TMPro.TMP_Glyph', i1007[i + 0]));
  }
  i994.m_glyphInfoList = i1006
  i994.m_KerningTable = request.d('TMPro.KerningTable', i995[34], i994.m_KerningTable)
  i994.m_FontFeatureTable = request.d('TMPro.TMP_FontFeatureTable', i995[35], i994.m_FontFeatureTable)
  var i1009 = i995[36]
  var i1008 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i1009.length; i += 2) {
  request.r(i1009[i + 0], i1009[i + 1], 1, i1008, '')
  }
  i994.fallbackFontAssets = i1008
  var i1011 = i995[37]
  var i1010 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i1011.length; i += 2) {
  request.r(i1011[i + 0], i1011[i + 1], 1, i1010, '')
  }
  i994.m_FallbackFontAssetTable = i1010
  i994.m_CreationSettings = request.d('TMPro.FontAssetCreationSettings', i995[38], i994.m_CreationSettings)
  var i1013 = i995[39]
  var i1012 = []
  for(var i = 0; i < i1013.length; i += 1) {
    i1012.push( request.d('TMPro.TMP_FontWeightPair', i1013[i + 0]) );
  }
  i994.m_FontWeightTable = i1012
  var i1015 = i995[40]
  var i1014 = []
  for(var i = 0; i < i1015.length; i += 1) {
    i1014.push( request.d('TMPro.TMP_FontWeightPair', i1015[i + 0]) );
  }
  i994.fontWeights = i1014
  return i994
}

Deserializers["UnityEngine.TextCore.FaceInfo"] = function (request, data, root) {
  var i1016 = root || request.c( 'UnityEngine.TextCore.FaceInfo' )
  var i1017 = data
  i1016.m_FaceIndex = i1017[0]
  i1016.m_FamilyName = i1017[1]
  i1016.m_StyleName = i1017[2]
  i1016.m_PointSize = i1017[3]
  i1016.m_Scale = i1017[4]
  i1016.m_UnitsPerEM = i1017[5]
  i1016.m_LineHeight = i1017[6]
  i1016.m_AscentLine = i1017[7]
  i1016.m_CapLine = i1017[8]
  i1016.m_MeanLine = i1017[9]
  i1016.m_Baseline = i1017[10]
  i1016.m_DescentLine = i1017[11]
  i1016.m_SuperscriptOffset = i1017[12]
  i1016.m_SuperscriptSize = i1017[13]
  i1016.m_SubscriptOffset = i1017[14]
  i1016.m_SubscriptSize = i1017[15]
  i1016.m_UnderlineOffset = i1017[16]
  i1016.m_UnderlineThickness = i1017[17]
  i1016.m_StrikethroughOffset = i1017[18]
  i1016.m_StrikethroughThickness = i1017[19]
  i1016.m_TabWidth = i1017[20]
  return i1016
}

Deserializers["UnityEngine.TextCore.Glyph"] = function (request, data, root) {
  var i1020 = root || request.c( 'UnityEngine.TextCore.Glyph' )
  var i1021 = data
  i1020.m_Index = i1021[0]
  i1020.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i1021[1], i1020.m_Metrics)
  i1020.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i1021[2], i1020.m_GlyphRect)
  i1020.m_Scale = i1021[3]
  i1020.m_AtlasIndex = i1021[4]
  i1020.m_ClassDefinitionType = i1021[5]
  return i1020
}

Deserializers["UnityEngine.TextCore.GlyphMetrics"] = function (request, data, root) {
  var i1022 = root || request.c( 'UnityEngine.TextCore.GlyphMetrics' )
  var i1023 = data
  i1022.m_Width = i1023[0]
  i1022.m_Height = i1023[1]
  i1022.m_HorizontalBearingX = i1023[2]
  i1022.m_HorizontalBearingY = i1023[3]
  i1022.m_HorizontalAdvance = i1023[4]
  return i1022
}

Deserializers["UnityEngine.TextCore.GlyphRect"] = function (request, data, root) {
  var i1024 = root || request.c( 'UnityEngine.TextCore.GlyphRect' )
  var i1025 = data
  i1024.m_X = i1025[0]
  i1024.m_Y = i1025[1]
  i1024.m_Width = i1025[2]
  i1024.m_Height = i1025[3]
  return i1024
}

Deserializers["TMPro.TMP_Character"] = function (request, data, root) {
  var i1028 = root || request.c( 'TMPro.TMP_Character' )
  var i1029 = data
  i1028.m_ElementType = i1029[0]
  i1028.m_Unicode = i1029[1]
  i1028.m_GlyphIndex = i1029[2]
  i1028.m_Scale = i1029[3]
  return i1028
}

Deserializers["TMPro.FaceInfo_Legacy"] = function (request, data, root) {
  var i1034 = root || request.c( 'TMPro.FaceInfo_Legacy' )
  var i1035 = data
  i1034.Name = i1035[0]
  i1034.PointSize = i1035[1]
  i1034.Scale = i1035[2]
  i1034.CharacterCount = i1035[3]
  i1034.LineHeight = i1035[4]
  i1034.Baseline = i1035[5]
  i1034.Ascender = i1035[6]
  i1034.CapHeight = i1035[7]
  i1034.Descender = i1035[8]
  i1034.CenterLine = i1035[9]
  i1034.SuperscriptOffset = i1035[10]
  i1034.SubscriptOffset = i1035[11]
  i1034.SubSize = i1035[12]
  i1034.Underline = i1035[13]
  i1034.UnderlineThickness = i1035[14]
  i1034.strikethrough = i1035[15]
  i1034.strikethroughThickness = i1035[16]
  i1034.TabWidth = i1035[17]
  i1034.Padding = i1035[18]
  i1034.AtlasWidth = i1035[19]
  i1034.AtlasHeight = i1035[20]
  return i1034
}

Deserializers["TMPro.TMP_Glyph"] = function (request, data, root) {
  var i1038 = root || request.c( 'TMPro.TMP_Glyph' )
  var i1039 = data
  i1038.id = i1039[0]
  i1038.x = i1039[1]
  i1038.y = i1039[2]
  i1038.width = i1039[3]
  i1038.height = i1039[4]
  i1038.xOffset = i1039[5]
  i1038.yOffset = i1039[6]
  i1038.xAdvance = i1039[7]
  i1038.scale = i1039[8]
  return i1038
}

Deserializers["TMPro.KerningTable"] = function (request, data, root) {
  var i1040 = root || request.c( 'TMPro.KerningTable' )
  var i1041 = data
  var i1043 = i1041[0]
  var i1042 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.KerningPair')))
  for(var i = 0; i < i1043.length; i += 1) {
    i1042.add(request.d('TMPro.KerningPair', i1043[i + 0]));
  }
  i1040.kerningPairs = i1042
  return i1040
}

Deserializers["TMPro.KerningPair"] = function (request, data, root) {
  var i1046 = root || request.c( 'TMPro.KerningPair' )
  var i1047 = data
  i1046.xOffset = i1047[0]
  i1046.m_FirstGlyph = i1047[1]
  i1046.m_FirstGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i1047[2], i1046.m_FirstGlyphAdjustments)
  i1046.m_SecondGlyph = i1047[3]
  i1046.m_SecondGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i1047[4], i1046.m_SecondGlyphAdjustments)
  i1046.m_IgnoreSpacingAdjustments = !!i1047[5]
  return i1046
}

Deserializers["TMPro.TMP_FontFeatureTable"] = function (request, data, root) {
  var i1048 = root || request.c( 'TMPro.TMP_FontFeatureTable' )
  var i1049 = data
  var i1051 = i1049[0]
  var i1050 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_GlyphPairAdjustmentRecord')))
  for(var i = 0; i < i1051.length; i += 1) {
    i1050.add(request.d('TMPro.TMP_GlyphPairAdjustmentRecord', i1051[i + 0]));
  }
  i1048.m_GlyphPairAdjustmentRecords = i1050
  return i1048
}

Deserializers["TMPro.TMP_GlyphPairAdjustmentRecord"] = function (request, data, root) {
  var i1054 = root || request.c( 'TMPro.TMP_GlyphPairAdjustmentRecord' )
  var i1055 = data
  i1054.m_FirstAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i1055[0], i1054.m_FirstAdjustmentRecord)
  i1054.m_SecondAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i1055[1], i1054.m_SecondAdjustmentRecord)
  i1054.m_FeatureLookupFlags = i1055[2]
  return i1054
}

Deserializers["TMPro.TMP_GlyphAdjustmentRecord"] = function (request, data, root) {
  var i1056 = root || request.c( 'TMPro.TMP_GlyphAdjustmentRecord' )
  var i1057 = data
  i1056.m_GlyphIndex = i1057[0]
  i1056.m_GlyphValueRecord = request.d('TMPro.TMP_GlyphValueRecord', i1057[1], i1056.m_GlyphValueRecord)
  return i1056
}

Deserializers["TMPro.TMP_GlyphValueRecord"] = function (request, data, root) {
  var i1058 = root || request.c( 'TMPro.TMP_GlyphValueRecord' )
  var i1059 = data
  i1058.m_XPlacement = i1059[0]
  i1058.m_YPlacement = i1059[1]
  i1058.m_XAdvance = i1059[2]
  i1058.m_YAdvance = i1059[3]
  return i1058
}

Deserializers["TMPro.FontAssetCreationSettings"] = function (request, data, root) {
  var i1060 = root || request.c( 'TMPro.FontAssetCreationSettings' )
  var i1061 = data
  i1060.sourceFontFileName = i1061[0]
  i1060.sourceFontFileGUID = i1061[1]
  i1060.pointSizeSamplingMode = i1061[2]
  i1060.pointSize = i1061[3]
  i1060.padding = i1061[4]
  i1060.packingMode = i1061[5]
  i1060.atlasWidth = i1061[6]
  i1060.atlasHeight = i1061[7]
  i1060.characterSetSelectionMode = i1061[8]
  i1060.characterSequence = i1061[9]
  i1060.referencedFontAssetGUID = i1061[10]
  i1060.referencedTextAssetGUID = i1061[11]
  i1060.fontStyle = i1061[12]
  i1060.fontStyleModifier = i1061[13]
  i1060.renderMode = i1061[14]
  i1060.includeFontFeatures = !!i1061[15]
  return i1060
}

Deserializers["TMPro.TMP_FontWeightPair"] = function (request, data, root) {
  var i1064 = root || request.c( 'TMPro.TMP_FontWeightPair' )
  var i1065 = data
  request.r(i1065[0], i1065[1], 0, i1064, 'regularTypeface')
  request.r(i1065[2], i1065[3], 0, i1064, 'italicTypeface')
  return i1064
}

Deserializers["TMPro.TMP_SpriteAsset"] = function (request, data, root) {
  var i1066 = root || request.c( 'TMPro.TMP_SpriteAsset' )
  var i1067 = data
  request.r(i1067[0], i1067[1], 0, i1066, 'spriteSheet')
  var i1069 = i1067[2]
  var i1068 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Sprite')))
  for(var i = 0; i < i1069.length; i += 1) {
    i1068.add(request.d('TMPro.TMP_Sprite', i1069[i + 0]));
  }
  i1066.spriteInfoList = i1068
  var i1071 = i1067[3]
  var i1070 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteAsset')))
  for(var i = 0; i < i1071.length; i += 2) {
  request.r(i1071[i + 0], i1071[i + 1], 1, i1070, '')
  }
  i1066.fallbackSpriteAssets = i1070
  i1066.hashCode = i1067[4]
  request.r(i1067[5], i1067[6], 0, i1066, 'material')
  i1066.materialHashCode = i1067[7]
  i1066.m_Version = i1067[8]
  i1066.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i1067[9], i1066.m_FaceInfo)
  var i1073 = i1067[10]
  var i1072 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteCharacter')))
  for(var i = 0; i < i1073.length; i += 1) {
    i1072.add(request.d('TMPro.TMP_SpriteCharacter', i1073[i + 0]));
  }
  i1066.m_SpriteCharacterTable = i1072
  var i1075 = i1067[11]
  var i1074 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteGlyph')))
  for(var i = 0; i < i1075.length; i += 1) {
    i1074.add(request.d('TMPro.TMP_SpriteGlyph', i1075[i + 0]));
  }
  i1066.m_SpriteGlyphTable = i1074
  return i1066
}

Deserializers["TMPro.TMP_Sprite"] = function (request, data, root) {
  var i1078 = root || request.c( 'TMPro.TMP_Sprite' )
  var i1079 = data
  i1078.name = i1079[0]
  i1078.hashCode = i1079[1]
  i1078.unicode = i1079[2]
  i1078.pivot = new pc.Vec2( i1079[3], i1079[4] )
  request.r(i1079[5], i1079[6], 0, i1078, 'sprite')
  i1078.id = i1079[7]
  i1078.x = i1079[8]
  i1078.y = i1079[9]
  i1078.width = i1079[10]
  i1078.height = i1079[11]
  i1078.xOffset = i1079[12]
  i1078.yOffset = i1079[13]
  i1078.xAdvance = i1079[14]
  i1078.scale = i1079[15]
  return i1078
}

Deserializers["TMPro.TMP_SpriteCharacter"] = function (request, data, root) {
  var i1084 = root || request.c( 'TMPro.TMP_SpriteCharacter' )
  var i1085 = data
  i1084.m_Name = i1085[0]
  i1084.m_HashCode = i1085[1]
  i1084.m_ElementType = i1085[2]
  i1084.m_Unicode = i1085[3]
  i1084.m_GlyphIndex = i1085[4]
  i1084.m_Scale = i1085[5]
  return i1084
}

Deserializers["TMPro.TMP_SpriteGlyph"] = function (request, data, root) {
  var i1088 = root || request.c( 'TMPro.TMP_SpriteGlyph' )
  var i1089 = data
  request.r(i1089[0], i1089[1], 0, i1088, 'sprite')
  i1088.m_Index = i1089[2]
  i1088.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i1089[3], i1088.m_Metrics)
  i1088.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i1089[4], i1088.m_GlyphRect)
  i1088.m_Scale = i1089[5]
  i1088.m_AtlasIndex = i1089[6]
  i1088.m_ClassDefinitionType = i1089[7]
  return i1088
}

Deserializers["TMPro.TMP_StyleSheet"] = function (request, data, root) {
  var i1090 = root || request.c( 'TMPro.TMP_StyleSheet' )
  var i1091 = data
  var i1093 = i1091[0]
  var i1092 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Style')))
  for(var i = 0; i < i1093.length; i += 1) {
    i1092.add(request.d('TMPro.TMP_Style', i1093[i + 0]));
  }
  i1090.m_StyleList = i1092
  return i1090
}

Deserializers["TMPro.TMP_Style"] = function (request, data, root) {
  var i1096 = root || request.c( 'TMPro.TMP_Style' )
  var i1097 = data
  i1096.m_Name = i1097[0]
  i1096.m_HashCode = i1097[1]
  i1096.m_OpeningDefinition = i1097[2]
  i1096.m_ClosingDefinition = i1097[3]
  i1096.m_OpeningTagArray = i1097[4]
  i1096.m_ClosingTagArray = i1097[5]
  i1096.m_OpeningTagUnicodeArray = i1097[6]
  i1096.m_ClosingTagUnicodeArray = i1097[7]
  return i1096
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources"] = function (request, data, root) {
  var i1098 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources' )
  var i1099 = data
  var i1101 = i1099[0]
  var i1100 = []
  for(var i = 0; i < i1101.length; i += 1) {
    i1100.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Resources+File', i1101[i + 0]) );
  }
  i1098.files = i1100
  i1098.componentToPrefabIds = i1099[1]
  return i1098
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources+File"] = function (request, data, root) {
  var i1104 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources+File' )
  var i1105 = data
  i1104.path = i1105[0]
  request.r(i1105[1], i1105[2], 0, i1104, 'unityObject')
  return i1104
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings"] = function (request, data, root) {
  var i1106 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings' )
  var i1107 = data
  var i1109 = i1107[0]
  var i1108 = []
  for(var i = 0; i < i1109.length; i += 1) {
    i1108.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder', i1109[i + 0]) );
  }
  i1106.scriptsExecutionOrder = i1108
  var i1111 = i1107[1]
  var i1110 = []
  for(var i = 0; i < i1111.length; i += 1) {
    i1110.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer', i1111[i + 0]) );
  }
  i1106.sortingLayers = i1110
  var i1113 = i1107[2]
  var i1112 = []
  for(var i = 0; i < i1113.length; i += 1) {
    i1112.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer', i1113[i + 0]) );
  }
  i1106.cullingLayers = i1112
  i1106.timeSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings', i1107[3], i1106.timeSettings)
  i1106.physicsSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings', i1107[4], i1106.physicsSettings)
  i1106.physics2DSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings', i1107[5], i1106.physics2DSettings)
  i1106.qualitySettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i1107[6], i1106.qualitySettings)
  i1106.enableRealtimeShadows = !!i1107[7]
  i1106.enableAutoInstancing = !!i1107[8]
  i1106.enableStaticBatching = !!i1107[9]
  i1106.enableDynamicBatching = !!i1107[10]
  i1106.usePreservativeDynamicBatching = !!i1107[11]
  i1106.lightmapEncodingQuality = i1107[12]
  i1106.desiredColorSpace = i1107[13]
  var i1115 = i1107[14]
  var i1114 = []
  for(var i = 0; i < i1115.length; i += 1) {
    i1114.push( i1115[i + 0] );
  }
  i1106.allTags = i1114
  return i1106
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder"] = function (request, data, root) {
  var i1118 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder' )
  var i1119 = data
  i1118.name = i1119[0]
  i1118.value = i1119[1]
  return i1118
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer"] = function (request, data, root) {
  var i1122 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer' )
  var i1123 = data
  i1122.id = i1123[0]
  i1122.name = i1123[1]
  i1122.value = i1123[2]
  return i1122
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer"] = function (request, data, root) {
  var i1126 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer' )
  var i1127 = data
  i1126.id = i1127[0]
  i1126.name = i1127[1]
  return i1126
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings"] = function (request, data, root) {
  var i1128 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings' )
  var i1129 = data
  i1128.fixedDeltaTime = i1129[0]
  i1128.maximumDeltaTime = i1129[1]
  i1128.timeScale = i1129[2]
  i1128.maximumParticleTimestep = i1129[3]
  return i1128
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings"] = function (request, data, root) {
  var i1130 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings' )
  var i1131 = data
  i1130.gravity = new pc.Vec3( i1131[0], i1131[1], i1131[2] )
  i1130.defaultSolverIterations = i1131[3]
  i1130.bounceThreshold = i1131[4]
  i1130.autoSyncTransforms = !!i1131[5]
  i1130.autoSimulation = !!i1131[6]
  var i1133 = i1131[7]
  var i1132 = []
  for(var i = 0; i < i1133.length; i += 1) {
    i1132.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask', i1133[i + 0]) );
  }
  i1130.collisionMatrix = i1132
  return i1130
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask"] = function (request, data, root) {
  var i1136 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask' )
  var i1137 = data
  i1136.enabled = !!i1137[0]
  i1136.layerId = i1137[1]
  i1136.otherLayerId = i1137[2]
  return i1136
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings"] = function (request, data, root) {
  var i1138 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings' )
  var i1139 = data
  request.r(i1139[0], i1139[1], 0, i1138, 'material')
  i1138.gravity = new pc.Vec2( i1139[2], i1139[3] )
  i1138.positionIterations = i1139[4]
  i1138.velocityIterations = i1139[5]
  i1138.velocityThreshold = i1139[6]
  i1138.maxLinearCorrection = i1139[7]
  i1138.maxAngularCorrection = i1139[8]
  i1138.maxTranslationSpeed = i1139[9]
  i1138.maxRotationSpeed = i1139[10]
  i1138.baumgarteScale = i1139[11]
  i1138.baumgarteTOIScale = i1139[12]
  i1138.timeToSleep = i1139[13]
  i1138.linearSleepTolerance = i1139[14]
  i1138.angularSleepTolerance = i1139[15]
  i1138.defaultContactOffset = i1139[16]
  i1138.autoSimulation = !!i1139[17]
  i1138.queriesHitTriggers = !!i1139[18]
  i1138.queriesStartInColliders = !!i1139[19]
  i1138.callbacksOnDisable = !!i1139[20]
  i1138.reuseCollisionCallbacks = !!i1139[21]
  i1138.autoSyncTransforms = !!i1139[22]
  var i1141 = i1139[23]
  var i1140 = []
  for(var i = 0; i < i1141.length; i += 1) {
    i1140.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask', i1141[i + 0]) );
  }
  i1138.collisionMatrix = i1140
  return i1138
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask"] = function (request, data, root) {
  var i1144 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask' )
  var i1145 = data
  i1144.enabled = !!i1145[0]
  i1144.layerId = i1145[1]
  i1144.otherLayerId = i1145[2]
  return i1144
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.QualitySettings"] = function (request, data, root) {
  var i1146 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.QualitySettings' )
  var i1147 = data
  var i1149 = i1147[0]
  var i1148 = []
  for(var i = 0; i < i1149.length; i += 1) {
    i1148.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i1149[i + 0]) );
  }
  i1146.qualityLevels = i1148
  var i1151 = i1147[1]
  var i1150 = []
  for(var i = 0; i < i1151.length; i += 1) {
    i1150.push( i1151[i + 0] );
  }
  i1146.names = i1150
  i1146.shadows = i1147[2]
  i1146.anisotropicFiltering = i1147[3]
  i1146.antiAliasing = i1147[4]
  i1146.lodBias = i1147[5]
  i1146.shadowCascades = i1147[6]
  i1146.shadowDistance = i1147[7]
  i1146.shadowmaskMode = i1147[8]
  i1146.shadowProjection = i1147[9]
  i1146.shadowResolution = i1147[10]
  i1146.softParticles = !!i1147[11]
  i1146.softVegetation = !!i1147[12]
  i1146.activeColorSpace = i1147[13]
  i1146.desiredColorSpace = i1147[14]
  i1146.masterTextureLimit = i1147[15]
  i1146.maxQueuedFrames = i1147[16]
  i1146.particleRaycastBudget = i1147[17]
  i1146.pixelLightCount = i1147[18]
  i1146.realtimeReflectionProbes = !!i1147[19]
  i1146.shadowCascade2Split = i1147[20]
  i1146.shadowCascade4Split = new pc.Vec3( i1147[21], i1147[22], i1147[23] )
  i1146.streamingMipmapsActive = !!i1147[24]
  i1146.vSyncCount = i1147[25]
  i1146.asyncUploadBufferSize = i1147[26]
  i1146.asyncUploadTimeSlice = i1147[27]
  i1146.billboardsFaceCameraPosition = !!i1147[28]
  i1146.shadowNearPlaneOffset = i1147[29]
  i1146.streamingMipmapsMemoryBudget = i1147[30]
  i1146.maximumLODLevel = i1147[31]
  i1146.streamingMipmapsAddAllCameras = !!i1147[32]
  i1146.streamingMipmapsMaxLevelReduction = i1147[33]
  i1146.streamingMipmapsRenderersPerFrame = i1147[34]
  i1146.resolutionScalingFixedDPIFactor = i1147[35]
  i1146.streamingMipmapsMaxFileIORequests = i1147[36]
  i1146.currentQualityLevel = i1147[37]
  return i1146
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame"] = function (request, data, root) {
  var i1156 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame' )
  var i1157 = data
  i1156.weight = i1157[0]
  i1156.vertices = i1157[1]
  i1156.normals = i1157[2]
  i1156.tangents = i1157[3]
  return i1156
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings"] = function (request, data, root) {
  var i1158 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings' )
  var i1159 = data
  i1158.Event = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1159[0], i1158.Event)
  i1158.filterSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings', i1159[1], i1158.filterSettings)
  i1158.overrideMaterialId = i1159[2]
  i1158.overrideMaterialPassIndex = i1159[3]
  i1158.overrideShaderId = i1159[4]
  i1158.overrideShaderPassIndex = i1159[5]
  i1158.overrideMode = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1159[6], i1158.overrideMode)
  i1158.overrideDepthState = !!i1159[7]
  i1158.depthCompareFunction = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1159[8], i1158.depthCompareFunction)
  i1158.enableWrite = !!i1159[9]
  i1158.stencilSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.StencilStateData', i1159[10], i1158.stencilSettings)
  i1158.cameraSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings', i1159[11], i1158.cameraSettings)
  return i1158
}

Deserializers["TMPro.GlyphValueRecord_Legacy"] = function (request, data, root) {
  var i1160 = root || request.c( 'TMPro.GlyphValueRecord_Legacy' )
  var i1161 = data
  i1160.xPlacement = i1161[0]
  i1160.yPlacement = i1161[1]
  i1160.xAdvance = i1161[2]
  i1160.yAdvance = i1161[3]
  return i1160
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.EnumDescription"] = function (request, data, root) {
  var i1162 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.EnumDescription' )
  var i1163 = data
  i1162.Value = i1163[0]
  return i1162
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings"] = function (request, data, root) {
  var i1164 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings' )
  var i1165 = data
  i1164.RenderQueueType = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1165[0], i1164.RenderQueueType)
  i1164.LayerMask = i1165[1]
  var i1167 = i1165[2]
  var i1166 = []
  for(var i = 0; i < i1167.length; i += 1) {
    i1166.push( i1167[i + 0] );
  }
  i1164.PassNames = i1166
  return i1164
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.StencilStateData"] = function (request, data, root) {
  var i1168 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.StencilStateData' )
  var i1169 = data
  i1168.overrideStencilState = !!i1169[0]
  i1168.stencilReference = i1169[1]
  i1168.stencilCompareFunctionValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1169[2], i1168.stencilCompareFunctionValue)
  i1168.passOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1169[3], i1168.passOperationValue)
  i1168.failOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1169[4], i1168.failOperationValue)
  i1168.zFailOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i1169[5], i1168.zFailOperationValue)
  return i1168
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings"] = function (request, data, root) {
  var i1170 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings' )
  var i1171 = data
  i1170.overrideCamera = !!i1171[0]
  i1170.restoreCamera = !!i1171[1]
  i1170.offset = new pc.Vec4( i1171[2], i1171[3], i1171[4], i1171[5] )
  i1170.cameraFieldOfView = i1171[6]
  return i1170
}

Deserializers.fields = {"Luna.Unity.DTO.UnityEngine.Assets.Mesh":{"name":0,"halfPrecision":1,"useSimplification":2,"useUInt32IndexFormat":3,"vertexCount":4,"aabb":5,"streams":6,"vertices":7,"subMeshes":8,"bindposes":9,"blendShapes":10},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh":{"triangles":0},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape":{"name":0,"frames":1},"Luna.Unity.DTO.UnityEngine.Assets.Material":{"name":0,"shader":1,"renderQueue":3,"enableInstancing":4,"floatParameters":5,"colorParameters":6,"vectorParameters":7,"textureParameters":8,"materialFlags":9},"Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag":{"name":0,"enabled":1},"Luna.Unity.DTO.UnityEngine.Textures.Texture2D":{"name":0,"width":1,"height":2,"mipmapCount":3,"anisoLevel":4,"filterMode":5,"hdr":6,"format":7,"wrapMode":8,"alphaIsTransparency":9,"alphaSource":10,"graphicsFormat":11,"sRGBTexture":12,"desiredColorSpace":13,"wrapU":14,"wrapV":15},"Luna.Unity.DTO.UnityEngine.Components.Transform":{"position":0,"scale":3,"rotation":6},"Luna.Unity.DTO.UnityEngine.Components.MeshFilter":{"sharedMesh":0},"Luna.Unity.DTO.UnityEngine.Components.MeshRenderer":{"additionalVertexStreams":0,"enabled":2,"sharedMaterial":3,"sharedMaterials":5,"receiveShadows":6,"shadowCastingMode":7,"sortingLayerID":8,"sortingOrder":9,"lightmapIndex":10,"lightmapSceneIndex":11,"lightmapScaleOffset":12,"lightProbeUsage":16,"reflectionProbeUsage":17},"Luna.Unity.DTO.UnityEngine.Components.SphereCollider":{"center":0,"radius":3,"enabled":4,"isTrigger":5,"material":6},"Luna.Unity.DTO.UnityEngine.Scene.GameObject":{"name":0,"tagId":1,"enabled":2,"isStatic":3,"layer":4},"Luna.Unity.DTO.UnityEngine.Textures.Cubemap":{"name":0,"atlasId":1,"mipmapCount":2,"hdr":3,"size":4,"anisoLevel":5,"filterMode":6,"rects":7,"wrapU":8,"wrapV":9},"Luna.Unity.DTO.UnityEngine.Scene.Scene":{"name":0,"index":1,"startup":2},"Luna.Unity.DTO.UnityEngine.Components.Light":{"type":0,"color":1,"cullingMask":5,"intensity":6,"range":7,"spotAngle":8,"shadows":9,"shadowNormalBias":10,"shadowBias":11,"shadowStrength":12,"shadowResolution":13,"lightmapBakeType":14,"renderMode":15,"cookie":16,"cookieSize":18,"shadowNearPlane":19,"occlusionMaskChannel":20,"isBaked":21,"mixedLightingMode":22,"enabled":23},"Luna.Unity.DTO.UnityEngine.Components.Camera":{"aspect":0,"orthographic":1,"orthographicSize":2,"backgroundColor":3,"nearClipPlane":7,"farClipPlane":8,"fieldOfView":9,"depth":10,"clearFlags":11,"cullingMask":12,"rect":13,"targetTexture":14,"usePhysicalProperties":16,"focalLength":17,"sensorSize":18,"lensShift":20,"gateFit":22,"commandBufferCount":23,"cameraType":24,"enabled":25},"Luna.Unity.DTO.UnityEngine.Components.MeshCollider":{"sharedMesh":0,"convex":2,"enabled":3,"isTrigger":4,"material":5},"Luna.Unity.DTO.UnityEngine.Components.RectTransform":{"pivot":0,"anchorMin":2,"anchorMax":4,"sizeDelta":6,"anchoredPosition3D":8,"rotation":11,"scale":15},"Luna.Unity.DTO.UnityEngine.Components.Canvas":{"planeDistance":0,"referencePixelsPerUnit":1,"isFallbackOverlay":2,"renderMode":3,"renderOrder":4,"sortingLayerName":5,"sortingOrder":6,"scaleFactor":7,"worldCamera":8,"overrideSorting":10,"pixelPerfect":11,"targetDisplay":12,"overridePixelPerfect":13,"enabled":14},"Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer":{"cullTransparentMesh":0},"Luna.Unity.DTO.UnityEngine.Components.CanvasGroup":{"m_Alpha":0,"m_Interactable":1,"m_BlocksRaycasts":2,"m_IgnoreParentGroups":3,"enabled":4},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings":{"ambientIntensity":0,"reflectionIntensity":1,"ambientMode":2,"ambientLight":3,"ambientSkyColor":7,"ambientGroundColor":11,"ambientEquatorColor":15,"fogColor":19,"fogEndDistance":23,"fogStartDistance":24,"fogDensity":25,"fog":26,"skybox":27,"fogMode":29,"lightmaps":30,"lightProbes":31,"lightmapsMode":32,"mixedBakeMode":33,"environmentLightingMode":34,"ambientProbe":35,"customReflection":36,"defaultReflection":38,"defaultReflectionMode":40,"defaultReflectionResolution":41,"sunLightObjectId":42,"pixelLightCount":43,"defaultReflectionHDR":44,"hasLightDataAsset":45,"hasManualGenerate":46},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap":{"lightmapColor":0,"lightmapDirection":2,"shadowMask":4},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes":{"bakedProbes":0,"positions":1,"hullRays":2,"tetrahedra":3,"neighbours":4,"matrices":5},"Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset":{"AdditionalLightsRenderingMode":0,"LightRenderingMode":1,"MainLightRenderingModeValue":2,"SupportsMainLightShadows":3,"MixedLightingSupported":4,"MainLightShadowmapResolutionValue":5,"SupportsSoftShadows":6,"SoftShadowQualityValue":7,"ShadowDistance":8,"ShadowCascadeCount":9,"Cascade2Split":10,"Cascade3Split":11,"Cascade4Split":13,"CascadeBorder":16,"ShadowDepthBias":17,"ShadowNormalBias":18,"RequireDepthTexture":19,"RequireOpaqueTexture":20,"scriptableRendererData":21},"Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode":{"Disabled":0,"PerVertex":1,"PerPixel":2},"Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData":{"opaqueLayerMask":0,"transparentLayerMask":1,"RenderObjectsFeatures":2,"name":3},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects":{"settings":0,"name":1,"typeName":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader":{"ShaderCompilationErrors":0,"name":1,"guid":2,"shaderDefinedKeywords":3,"passes":4,"usePasses":5,"defaultParameterValues":6,"unityFallbackShader":7,"readDepth":9,"hasDepthOnlyPass":10,"isCreatedByShaderGraph":11,"disableBatching":12,"compiled":13},"Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError":{"shaderName":0,"errorMessage":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass":{"id":0,"subShaderIndex":1,"name":2,"passType":3,"grabPassTextureName":4,"usePass":5,"zTest":6,"zWrite":7,"culling":8,"blending":9,"alphaBlending":10,"colorWriteMask":11,"offsetUnits":12,"offsetFactor":13,"stencilRef":14,"stencilReadMask":15,"stencilWriteMask":16,"stencilOp":17,"stencilOpFront":18,"stencilOpBack":19,"tags":20,"passDefinedKeywords":21,"passDefinedKeywordGroups":22,"variants":23,"excludedVariants":24,"hasDepthReader":25},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value":{"val":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending":{"src":0,"dst":1,"op":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp":{"pass":0,"fail":1,"zFail":2,"comp":3},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup":{"keywords":0,"hasDiscard":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant":{"passId":0,"subShaderIndex":1,"keywords":2,"vertexProgram":3,"fragmentProgram":4,"exportedForWebGl2":5,"readDepth":6},"Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass":{"shader":0,"pass":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue":{"name":0,"type":1,"value":2,"textureValue":6,"shaderPropertyFlag":7},"Luna.Unity.DTO.UnityEngine.Textures.Sprite":{"name":0,"texture":1,"aabb":3,"vertices":4,"triangles":5,"textureRect":6,"packedRect":10,"border":14,"transparency":18,"bounds":19,"pixelsPerUnit":20,"textureWidth":21,"textureHeight":22,"nativeSize":23,"pivot":25,"textureRectOffset":27},"Luna.Unity.DTO.UnityEngine.Assets.AudioClip":{"name":0},"Luna.Unity.DTO.UnityEngine.Assets.Font":{"name":0,"ascent":1,"originalLineHeight":2,"fontSize":3,"characterInfo":4,"texture":5,"originalFontSize":7},"Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo":{"index":0,"advance":1,"bearing":2,"glyphWidth":3,"glyphHeight":4,"minX":5,"maxX":6,"minY":7,"maxY":8,"uvBottomLeftX":9,"uvBottomLeftY":10,"uvBottomRightX":11,"uvBottomRightY":12,"uvTopLeftX":13,"uvTopLeftY":14,"uvTopRightX":15,"uvTopRightY":16},"Luna.Unity.DTO.UnityEngine.Assets.TextAsset":{"name":0,"bytes64":1,"data":2},"Luna.Unity.DTO.UnityEngine.Assets.Resources":{"files":0,"componentToPrefabIds":1},"Luna.Unity.DTO.UnityEngine.Assets.Resources+File":{"path":0,"unityObject":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings":{"scriptsExecutionOrder":0,"sortingLayers":1,"cullingLayers":2,"timeSettings":3,"physicsSettings":4,"physics2DSettings":5,"qualitySettings":6,"enableRealtimeShadows":7,"enableAutoInstancing":8,"enableStaticBatching":9,"enableDynamicBatching":10,"usePreservativeDynamicBatching":11,"lightmapEncodingQuality":12,"desiredColorSpace":13,"allTags":14},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer":{"id":0,"name":1,"value":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer":{"id":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings":{"fixedDeltaTime":0,"maximumDeltaTime":1,"timeScale":2,"maximumParticleTimestep":3},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings":{"gravity":0,"defaultSolverIterations":3,"bounceThreshold":4,"autoSyncTransforms":5,"autoSimulation":6,"collisionMatrix":7},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings":{"material":0,"gravity":2,"positionIterations":4,"velocityIterations":5,"velocityThreshold":6,"maxLinearCorrection":7,"maxAngularCorrection":8,"maxTranslationSpeed":9,"maxRotationSpeed":10,"baumgarteScale":11,"baumgarteTOIScale":12,"timeToSleep":13,"linearSleepTolerance":14,"angularSleepTolerance":15,"defaultContactOffset":16,"autoSimulation":17,"queriesHitTriggers":18,"queriesStartInColliders":19,"callbacksOnDisable":20,"reuseCollisionCallbacks":21,"autoSyncTransforms":22,"collisionMatrix":23},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.QualitySettings":{"qualityLevels":0,"names":1,"shadows":2,"anisotropicFiltering":3,"antiAliasing":4,"lodBias":5,"shadowCascades":6,"shadowDistance":7,"shadowmaskMode":8,"shadowProjection":9,"shadowResolution":10,"softParticles":11,"softVegetation":12,"activeColorSpace":13,"desiredColorSpace":14,"masterTextureLimit":15,"maxQueuedFrames":16,"particleRaycastBudget":17,"pixelLightCount":18,"realtimeReflectionProbes":19,"shadowCascade2Split":20,"shadowCascade4Split":21,"streamingMipmapsActive":24,"vSyncCount":25,"asyncUploadBufferSize":26,"asyncUploadTimeSlice":27,"billboardsFaceCameraPosition":28,"shadowNearPlaneOffset":29,"streamingMipmapsMemoryBudget":30,"maximumLODLevel":31,"streamingMipmapsAddAllCameras":32,"streamingMipmapsMaxLevelReduction":33,"streamingMipmapsRenderersPerFrame":34,"resolutionScalingFixedDPIFactor":35,"streamingMipmapsMaxFileIORequests":36,"currentQualityLevel":37},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame":{"weight":0,"vertices":1,"normals":2,"tangents":3},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings":{"Event":0,"filterSettings":1,"overrideMaterialId":2,"overrideMaterialPassIndex":3,"overrideShaderId":4,"overrideShaderPassIndex":5,"overrideMode":6,"overrideDepthState":7,"depthCompareFunction":8,"enableWrite":9,"stencilSettings":10,"cameraSettings":11},"Luna.Unity.DTO.UnityEngine.Assets.EnumDescription":{"Value":0},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings":{"RenderQueueType":0,"LayerMask":1,"PassNames":2},"Luna.Unity.DTO.UnityEngine.Assets.StencilStateData":{"overrideStencilState":0,"stencilReference":1,"stencilCompareFunctionValue":2,"passOperationValue":3,"failOperationValue":4,"zFailOperationValue":5},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings":{"overrideCamera":0,"restoreCamera":1,"offset":2,"cameraFieldOfView":6}}

Deserializers.requiredComponents = {"63":[64],"65":[64],"66":[64],"67":[64],"68":[64],"69":[64],"70":[71],"72":[19],"73":[74],"75":[74],"76":[74],"77":[74],"78":[74],"79":[74],"80":[74],"81":[82],"83":[82],"84":[82],"85":[82],"86":[82],"87":[82],"88":[82],"89":[82],"90":[82],"91":[82],"92":[82],"93":[82],"94":[82],"95":[19],"96":[5],"97":[98],"99":[98],"27":[26],"100":[26],"101":[19],"21":[19],"13":[12],"102":[26],"103":[5,26],"104":[26,47],"105":[26],"106":[47,26],"107":[5],"108":[47,26],"109":[26],"110":[111],"112":[111],"113":[111],"114":[26],"115":[26],"46":[27],"43":[47,26],"116":[26],"45":[27],"117":[26],"118":[26],"119":[26],"120":[26],"121":[26],"122":[26],"123":[26],"124":[26],"125":[26],"126":[47,26],"127":[26],"128":[26],"129":[26],"130":[26],"131":[47,26],"132":[26],"133":[17],"134":[17],"18":[17],"135":[17],"136":[19],"137":[19]}

Deserializers.types = ["UnityEngine.Shader","UnityEngine.Texture2D","UnityEngine.Transform","UnityEngine.MeshFilter","UnityEngine.Mesh","UnityEngine.MeshRenderer","UnityEngine.Material","UnityEngine.MonoBehaviour","Marble","UnityEngine.SphereCollider","Tray","TrayAnimation","UnityEngine.Light","UnityEngine.Rendering.Universal.UniversalAdditionalLightData","UnityEngine.Rendering.Volume","UnityEngine.Rendering.VolumeProfile","UnityEngine.EventSystems.UIBehaviour","UnityEngine.EventSystems.EventSystem","UnityEngine.EventSystems.StandaloneInputModule","UnityEngine.Camera","UnityEngine.AudioListener","UnityEngine.Rendering.Universal.UniversalAdditionalCameraData","UnityEngine.MeshCollider","MarbleBoardGenerator","MarbleLevelData","MarbleDatabase","UnityEngine.RectTransform","UnityEngine.Canvas","TrayGenerator","TrayLevelData","TrayDatabase","TrayManager","MarbleAnimationManager","RampWaypoints","MarbleIntroSpawner","MarbleIntroAnimation","CTAManager","EndCardManager","UnityEngine.CanvasGroup","UnityEngine.GameObject","TutorialManager","AudioManager","AudioLibrary","UnityEngine.UI.Image","MarbleColumn","UnityEngine.UI.CanvasScaler","UnityEngine.UI.GraphicRaycaster","UnityEngine.CanvasRenderer","UnityEngine.Sprite","UnityEngine.UI.Button","UnityEngine.Cubemap","UnityEngine.Rendering.Universal.Tonemapping","UnityEngine.Rendering.Universal.Bloom","UnityEngine.Rendering.Universal.MotionBlur","UnityEngine.Rendering.Universal.Vignette","UnityEngine.AudioClip","DG.Tweening.Core.DOTweenSettings","TMPro.TMP_Settings","TMPro.TMP_FontAsset","TMPro.TMP_SpriteAsset","TMPro.TMP_StyleSheet","UnityEngine.TextAsset","UnityEngine.Font","UnityEngine.AudioLowPassFilter","UnityEngine.AudioBehaviour","UnityEngine.AudioHighPassFilter","UnityEngine.AudioReverbFilter","UnityEngine.AudioDistortionFilter","UnityEngine.AudioEchoFilter","UnityEngine.AudioChorusFilter","UnityEngine.Cloth","UnityEngine.SkinnedMeshRenderer","UnityEngine.FlareLayer","UnityEngine.ConstantForce","UnityEngine.Rigidbody","UnityEngine.Joint","UnityEngine.HingeJoint","UnityEngine.SpringJoint","UnityEngine.FixedJoint","UnityEngine.CharacterJoint","UnityEngine.ConfigurableJoint","UnityEngine.CompositeCollider2D","UnityEngine.Rigidbody2D","UnityEngine.Joint2D","UnityEngine.AnchoredJoint2D","UnityEngine.SpringJoint2D","UnityEngine.DistanceJoint2D","UnityEngine.FrictionJoint2D","UnityEngine.HingeJoint2D","UnityEngine.RelativeJoint2D","UnityEngine.SliderJoint2D","UnityEngine.TargetJoint2D","UnityEngine.FixedJoint2D","UnityEngine.WheelJoint2D","UnityEngine.ConstantForce2D","UnityEngine.StreamingController","UnityEngine.TextMesh","UnityEngine.Tilemaps.TilemapRenderer","UnityEngine.Tilemaps.Tilemap","UnityEngine.Tilemaps.TilemapCollider2D","UnityEngine.Rendering.UI.UIFoldout","UnityEngine.Experimental.Rendering.Universal.PixelPerfectCamera","TMPro.TextContainer","TMPro.TextMeshPro","TMPro.TextMeshProUGUI","TMPro.TMP_Dropdown","TMPro.TMP_SelectionCaret","TMPro.TMP_SubMesh","TMPro.TMP_SubMeshUI","TMPro.TMP_Text","Unity.VisualScripting.SceneVariables","Unity.VisualScripting.Variables","Unity.VisualScripting.ScriptMachine","Unity.VisualScripting.StateMachine","UnityEngine.UI.Dropdown","UnityEngine.UI.Graphic","UnityEngine.UI.AspectRatioFitter","UnityEngine.UI.ContentSizeFitter","UnityEngine.UI.GridLayoutGroup","UnityEngine.UI.HorizontalLayoutGroup","UnityEngine.UI.HorizontalOrVerticalLayoutGroup","UnityEngine.UI.LayoutElement","UnityEngine.UI.LayoutGroup","UnityEngine.UI.VerticalLayoutGroup","UnityEngine.UI.Mask","UnityEngine.UI.MaskableGraphic","UnityEngine.UI.RawImage","UnityEngine.UI.RectMask2D","UnityEngine.UI.Scrollbar","UnityEngine.UI.ScrollRect","UnityEngine.UI.Slider","UnityEngine.UI.Text","UnityEngine.UI.Toggle","UnityEngine.EventSystems.BaseInputModule","UnityEngine.EventSystems.PointerInputModule","UnityEngine.EventSystems.TouchInputModule","UnityEngine.EventSystems.Physics2DRaycaster","UnityEngine.EventSystems.PhysicsRaycaster"]

Deserializers.unityVersion = "2023.1.0f1";

Deserializers.productName = "Ludios";

Deserializers.lunaInitializationTime = "11/03/2026 05:45:41";

Deserializers.lunaDaysRunning = "0.0";

Deserializers.lunaVersion = "7.2.0";

Deserializers.lunaSHA = "ea08d29afe2968efcb8d91d5624f033c6485cc68";

Deserializers.creativeName = "Ludios";

Deserializers.lunaAppID = "30032";

Deserializers.projectId = "452be7a89c115bc4796b4acf29b5bc0e";

Deserializers.packagesInfo = "com.unity.render-pipelines.universal: 15.0.6\ncom.unity.textmeshpro: 3.0.6\ncom.unity.timeline: 1.8.2\ncom.unity.ugui: 1.0.0";

Deserializers.externalJsLibraries = "";

Deserializers.androidLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.androidLink?window.$environment.packageConfig.androidLink:'Empty';

Deserializers.iosLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.iosLink?window.$environment.packageConfig.iosLink:'Empty';

Deserializers.base64Enabled = "False";

Deserializers.minifyEnabled = "True";

Deserializers.isForceUncompressed = "False";

Deserializers.isAntiAliasingEnabled = "False";

Deserializers.isRuntimeAnalysisEnabledForCode = "False";

Deserializers.runtimeAnalysisExcludedClassesCount = "0";

Deserializers.runtimeAnalysisExcludedMethodsCount = "0";

Deserializers.runtimeAnalysisExcludedModules = "";

Deserializers.isRuntimeAnalysisEnabledForShaders = "False";

Deserializers.isRealtimeShadowsEnabled = "True";

Deserializers.isLunaCompilerV2Used = "False";

Deserializers.companyName = "DefaultCompany";

Deserializers.buildPlatform = "StandaloneWindows64";

Deserializers.applicationIdentifier = "com.Unity-Technologies.com.unity.template.urp-blank";

Deserializers.disableAntiAliasing = true;

Deserializers.graphicsConstraint = 24;

Deserializers.linearColorSpace = true;

Deserializers.buildID = "e43b10f1-306d-485f-9996-0dce5270d766";

Deserializers.runtimeInitializeOnLoadInfos = [[["UnityEngine","Rendering","DebugUpdater","RuntimeInit"],["UnityEngine","Experimental","Rendering","ScriptableRuntimeReflectionSystemSettings","ScriptingDirtyReflectionSystemInstance"]],[["Unity","VisualScripting","RuntimeVSUsageUtility","RuntimeInitializeOnLoadBeforeSceneLoad"]],[],[["UnityEngine","Experimental","Rendering","XRSystem","XRSystemInit"]],[]];

Deserializers.typeNameToIdMap = function(){ var i = 0; return Deserializers.types.reduce( function( res, item ) { res[ item ] = i++; return res; }, {} ) }()

