if ( TRACE ) { TRACE( JSON.parse( '["AnimationSeqStep#getDefaultValue","AnimationSeqStep#init","AnimationSeqStep#ctor","AnimationSeqStep#getHashCode","AnimationSeqStep#equals","AnimationSeqStep#$clone","AnimationStep#getDefaultValue","AnimationStep#init","AnimationStep#ctor","AnimationStep#getHashCode","AnimationStep#equals","AnimationStep#$clone","AudioLibrary#init","AudioLibrary#Initialize","AudioLibrary#TryGetClip","AudioLibrary.ClipEntry#getDefaultValue","AudioLibrary.ClipEntry#ctor","AudioLibrary.ClipEntry#getHashCode","AudioLibrary.ClipEntry#equals","AudioLibrary.ClipEntry#$clone","BoardManager#init","BoardManager#Awake","BoardManager#GetClosestSlot","BoardManager#GetSlotAtPosition","BoardManager#CheckAllBricks","BoardManager#CheckIfLastBricks","Brick#init","Brick#Awake","Brick#FixedUpdate","Brick#GetMouseWorld","Brick#Dragging","Brick#CheckForGateWhileDragging","Brick#TrySnap","Brick#SnapToSlots","Brick#SnapBack","Brick#ClearSlots","Brick#CaptureReleasedSlots","Brick#RestoreReleasedSlots","Brick#KillTween","Brick#SetDraggingState","Brick#IsBlocked","Brick#RaiseMesh","Brick#ResetMeshPosition","Brick#Drag","Brick#Drop","Brick#GetOccupiedSlots","Brick#RegisterInitialSlot","Brick#DisablePhysics","Brick#IsBlockedInDirection","BrickCell#init","BrickCell#Awake","BrickCell#IsBlocked","BrickCell#IsNeighborBlocked","CameraFitter#init","CameraFitter#Awake","CameraFitter#Start","CameraFitter#Update","CameraFitter#ApplyFit","CameraManager#init","CameraManager#Awake","CameraManager#Start","CameraManager#Update","CameraManager#SmoothPan","CameraManager#PanToClick","CameraManager#GetPanDirection","CameraManager#HandleZoom","CameraManager#DOZoom","CameraManager#KillTweens","CameraManager#Shake","CameraManager#Shake$1","CameraManager#AnimateReturn","CameraManager#Animate","CameraManager#AnimateSeq","ClickCounter#Awake","ClickCounter#Initialize","ClickCounter#RegisterClick","ControlManager#init","ControlManager#Awake","ControlManager#Update","ControlManager#ControllersManagers","ControlManager#ForceRelease","Core.Services.ServicesLocator#init","Core.Services.ServicesLocator#Register","Core.Services.ServicesLocator#Get","Core.Services.ServicesLocator#Unregister","Core.Services.ServicesLocator#ClearAll","CTAManager#init","CTAManager#Awake","CTAManager#Start","CTAManager#Update","CTAManager#CTAClick","CTAManager#EnableCTA","CTAManager#CTAClickAlt","DG.Tweening.DOTweenCYInstruction.WaitForCompletion#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForCompletion#ctor","DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops#ctor","DG.Tweening.DOTweenCYInstruction.WaitForKill#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForKill#ctor","DG.Tweening.DOTweenCYInstruction.WaitForPosition#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForPosition#ctor","DG.Tweening.DOTweenCYInstruction.WaitForRewind#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForRewind#ctor","DG.Tweening.DOTweenCYInstruction.WaitForStart#keepWaiting#get","DG.Tweening.DOTweenCYInstruction.WaitForStart#ctor","DG.Tweening.DOTweenModuleAudio#DOFade","DG.Tweening.DOTweenModuleAudio#DOPitch","DG.Tweening.DOTweenModuleAudio#DOSetFloat","DG.Tweening.DOTweenModuleAudio#DOComplete","DG.Tweening.DOTweenModuleAudio#DOKill","DG.Tweening.DOTweenModuleAudio#DOFlip","DG.Tweening.DOTweenModuleAudio#DOGoto","DG.Tweening.DOTweenModuleAudio#DOPause","DG.Tweening.DOTweenModuleAudio#DOPlay","DG.Tweening.DOTweenModuleAudio#DOPlayBackwards","DG.Tweening.DOTweenModuleAudio#DOPlayForward","DG.Tweening.DOTweenModuleAudio#DORestart","DG.Tweening.DOTweenModuleAudio#DORewind","DG.Tweening.DOTweenModuleAudio#DOSmoothRewind","DG.Tweening.DOTweenModuleAudio#DOTogglePause","DG.Tweening.DOTweenModulePhysics#DOMove","DG.Tweening.DOTweenModulePhysics#DOMoveX","DG.Tweening.DOTweenModulePhysics#DOMoveY","DG.Tweening.DOTweenModulePhysics#DOMoveZ","DG.Tweening.DOTweenModulePhysics#DORotate","DG.Tweening.DOTweenModulePhysics#DOLookAt","DG.Tweening.DOTweenModulePhysics#DOJump","DG.Tweening.DOTweenModulePhysics#DOPath","DG.Tweening.DOTweenModulePhysics#DOPath$1","DG.Tweening.DOTweenModulePhysics#DOLocalPath","DG.Tweening.DOTweenModulePhysics#DOLocalPath$1","DG.Tweening.DOTweenModulePhysics2D#DOMove","DG.Tweening.DOTweenModulePhysics2D#DOMoveX","DG.Tweening.DOTweenModulePhysics2D#DOMoveY","DG.Tweening.DOTweenModulePhysics2D#DORotate","DG.Tweening.DOTweenModulePhysics2D#DOJump","DG.Tweening.DOTweenModulePhysics2D#DOPath","DG.Tweening.DOTweenModulePhysics2D#DOPath$1","DG.Tweening.DOTweenModulePhysics2D#DOLocalPath","DG.Tweening.DOTweenModulePhysics2D#DOLocalPath$1","DG.Tweening.DOTweenModuleSprite#DOColor","DG.Tweening.DOTweenModuleSprite#DOFade","DG.Tweening.DOTweenModuleSprite#DOGradientColor","DG.Tweening.DOTweenModuleSprite#DOBlendableColor","DG.Tweening.DOTweenModuleUI#DOFade","DG.Tweening.DOTweenModuleUI#DOFade$1","DG.Tweening.DOTweenModuleUI#DOFade$2","DG.Tweening.DOTweenModuleUI#DOFade$3","DG.Tweening.DOTweenModuleUI#DOFade$4","DG.Tweening.DOTweenModuleUI#DOColor","DG.Tweening.DOTweenModuleUI#DOColor$1","DG.Tweening.DOTweenModuleUI#DOColor$2","DG.Tweening.DOTweenModuleUI#DOColor$3","DG.Tweening.DOTweenModuleUI#DOFillAmount","DG.Tweening.DOTweenModuleUI#DOGradientColor","DG.Tweening.DOTweenModuleUI#DOFlexibleSize","DG.Tweening.DOTweenModuleUI#DOMinSize","DG.Tweening.DOTweenModuleUI#DOPreferredSize","DG.Tweening.DOTweenModuleUI#DOScale","DG.Tweening.DOTweenModuleUI#DOAnchorPos","DG.Tweening.DOTweenModuleUI#DOAnchorPosX","DG.Tweening.DOTweenModuleUI#DOAnchorPosY","DG.Tweening.DOTweenModuleUI#DOAnchorPos3D","DG.Tweening.DOTweenModuleUI#DOAnchorPos3DX","DG.Tweening.DOTweenModuleUI#DOAnchorPos3DY","DG.Tweening.DOTweenModuleUI#DOAnchorPos3DZ","DG.Tweening.DOTweenModuleUI#DOAnchorMax","DG.Tweening.DOTweenModuleUI#DOAnchorMin","DG.Tweening.DOTweenModuleUI#DOPivot","DG.Tweening.DOTweenModuleUI#DOPivotX","DG.Tweening.DOTweenModuleUI#DOPivotY","DG.Tweening.DOTweenModuleUI#DOSizeDelta","DG.Tweening.DOTweenModuleUI#DOPunchAnchorPos","DG.Tweening.DOTweenModuleUI#DOShakeAnchorPos","DG.Tweening.DOTweenModuleUI#DOShakeAnchorPos$1","DG.Tweening.DOTweenModuleUI#DOJumpAnchorPos","DG.Tweening.DOTweenModuleUI#DONormalizedPos","DG.Tweening.DOTweenModuleUI#DOHorizontalNormalizedPos","DG.Tweening.DOTweenModuleUI#DOVerticalNormalizedPos","DG.Tweening.DOTweenModuleUI#DOValue","DG.Tweening.DOTweenModuleUI#DOCounter","DG.Tweening.DOTweenModuleUI#DOText","DG.Tweening.DOTweenModuleUI#DOBlendableColor","DG.Tweening.DOTweenModuleUI#DOBlendableColor$1","DG.Tweening.DOTweenModuleUI#DOBlendableColor$2","DG.Tweening.DOTweenModuleUI#DOShapeCircle","DG.Tweening.DOTweenModuleUI.Utils#SwitchToRectTransform","DG.Tweening.DOTweenModuleUnityVersion#DOGradientColor","DG.Tweening.DOTweenModuleUnityVersion#DOGradientColor$1","DG.Tweening.DOTweenModuleUnityVersion#WaitForCompletion","DG.Tweening.DOTweenModuleUnityVersion#WaitForRewind","DG.Tweening.DOTweenModuleUnityVersion#WaitForKill","DG.Tweening.DOTweenModuleUnityVersion#WaitForElapsedLoops","DG.Tweening.DOTweenModuleUnityVersion#WaitForPosition","DG.Tweening.DOTweenModuleUnityVersion#WaitForStart","DG.Tweening.DOTweenModuleUnityVersion#DOOffset","DG.Tweening.DOTweenModuleUnityVersion#DOTiling","DG.Tweening.DOTweenModuleUtils#Init","DG.Tweening.DOTweenModuleUtils#Preserver","DG.Tweening.DOTweenModuleUtils.Physics#SetOrientationOnPath","DG.Tweening.DOTweenModuleUtils.Physics#HasRigidbody2D","DG.Tweening.DOTweenModuleUtils.Physics#HasRigidbody","DG.Tweening.DOTweenModuleUtils.Physics#CreateDOTweenPathTween","GameManager#init","GameManager#Awake","GameManager#Start","GameManager#Update","GameManager#HighlightGateColor","GameManager#StartGateHighlight","GameManager#StopGateHighlights","GameManager#SetMaterialAlpha","GameManager#TryFindValidMove","GameManager#GetDirectionToMatchingGate","GameManager#GetBrickCenter","GameManager#ShuffleDirections","GameManager#CanBrickMove","GameManager#StartHintHandAnimationLoop","GameManager#SetAlpha","GameManager#GetAlpha","GameManager#StopHint","GameManager#StartHint","GameManager#StopTutorial","GameManager#StartTutorial","Gate#init","Gate#StartBounceMatchingGates","Gate#StopBounceMatchingGates","Gate#VfxPosition#get","Gate#init","Gate#Awake","Gate#Start","Gate#OnDestroy","Gate#MatchesColor","Gate#CanAccept","Gate#Absorb","Gate#Lower","Gate#StartBounce","Gate#StopBounce","Gate#FindNearbySlots","Gate#CheckWin","GridSlot#IsOccupied#get","GridSlot#WorldPosition#get","GridSlot#init","GridSlot#Start","GridSlot#DetectInitialBrick","GridSlot#SetOccupying","GridSlot#Clear","IterationVariantManagers#init","IterationVariantManagers#init","IterationVariantManagers#Awake","IterationVariantManagers#Start","IterationVariantManagers#SetupVariant","IterationVariantManagers#ApplyIterationAndVariantMode","IterationVariantManagers#StartIteration","IterationVariantManagers#RegisterClick","IterationVariantManagers#ShowEndCard","IterationVariantManagers#CanShowEndCardOnLastBricks","IterationVariantManagers#Update","IterationVariantManagers#ConfigureClickLimit","IterationVariantManagers#ConfigureTimeLimit","IterationVariantManagers#ConfigureFull","IterationVariantManagers#UpdateClickTexts","IterationVariantManagers#UpdateClickTexts$1","IterationVariantManagers#UpdateTimerTexts","IterationVariantManagers#UpdateTimerTexts$1","ScoreManager#init","ScoreManager#Awake","ScoreManager#UpdateUIImmediate","ScoreManager#Initialize","ScoreManager#AddScore","ScoreManager#GetScore","AudioManager#init","AudioManager#Awake","AudioManager#Start","AudioManager#WaitOnTap","AudioManager#OnDisable","AudioManager#PlaySFX","AudioManager#PlayMusic","AudioManager#StopMusic$1","AudioManager#StopMusic","AudioManager#SetMusicVolume","AudioManager#SetSFXVolume","AudioManager#ReturnToPoolWhenDone","AudioManager#CrossfadeMusic"]' ) ); }
/**
 * @version 1.0.9649.20308
 * @copyright anton
 * @compiler Bridge.NET 17.9.42-luna
 */
Bridge.assembly("UnityScriptsCompiler", function ($asm, globals) {
    "use strict";

    /*AnimationSeqStep start.*/
    Bridge.define("AnimationSeqStep", {
        $kind: 4,
        statics: {
            methods: {
                getDefaultValue: function () {
if ( TRACE ) { TRACE( "AnimationSeqStep#getDefaultValue", this ); }
 return new AnimationSeqStep(); }
            }
        },
        fields: {
            target: null,
            duration: 0,
            pause: 0,
            zoom: 0,
            ease: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "AnimationSeqStep#init", this ); }

                this.target = new UnityEngine.Vector3();
            },
            ctor: function () {
if ( TRACE ) { TRACE( "AnimationSeqStep#ctor", this ); }

                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
if ( TRACE ) { TRACE( "AnimationSeqStep#getHashCode", this ); }

                var h = Bridge.addHash([7492971107, this.target, this.duration, this.pause, this.zoom, this.ease]);
                return h;
            },
            equals: function (o) {
if ( TRACE ) { TRACE( "AnimationSeqStep#equals", this ); }

                if (!Bridge.is(o, AnimationSeqStep)) {
                    return false;
                }
                return Bridge.equals(this.target, o.target) && Bridge.equals(this.duration, o.duration) && Bridge.equals(this.pause, o.pause) && Bridge.equals(this.zoom, o.zoom) && Bridge.equals(this.ease, o.ease);
            },
            $clone: function (to) {
if ( TRACE ) { TRACE( "AnimationSeqStep#$clone", this ); }

                var s = to || new AnimationSeqStep();
                s.target = this.target.$clone();
                s.duration = this.duration;
                s.pause = this.pause;
                s.zoom = this.zoom;
                s.ease = this.ease;
                return s;
            }
        }
    });
    /*AnimationSeqStep end.*/

    /*AnimationStep start.*/
    Bridge.define("AnimationStep", {
        $kind: 4,
        statics: {
            methods: {
                getDefaultValue: function () {
if ( TRACE ) { TRACE( "AnimationStep#getDefaultValue", this ); }
 return new AnimationStep(); }
            }
        },
        fields: {
            target: null,
            duration: 0,
            zoom: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "AnimationStep#init", this ); }

                this.target = new UnityEngine.Vector3();
            },
            ctor: function () {
if ( TRACE ) { TRACE( "AnimationStep#ctor", this ); }

                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
if ( TRACE ) { TRACE( "AnimationStep#getHashCode", this ); }

                var h = Bridge.addHash([5406930560, this.target, this.duration, this.zoom]);
                return h;
            },
            equals: function (o) {
if ( TRACE ) { TRACE( "AnimationStep#equals", this ); }

                if (!Bridge.is(o, AnimationStep)) {
                    return false;
                }
                return Bridge.equals(this.target, o.target) && Bridge.equals(this.duration, o.duration) && Bridge.equals(this.zoom, o.zoom);
            },
            $clone: function (to) {
if ( TRACE ) { TRACE( "AnimationStep#$clone", this ); }

                var s = to || new AnimationStep();
                s.target = this.target.$clone();
                s.duration = this.duration;
                s.zoom = this.zoom;
                return s;
            }
        }
    });
    /*AnimationStep end.*/

    /*AudioChannel start.*/
    Bridge.define("AudioChannel", {
        $kind: 6,
        statics: {
            fields: {
                Music: 0,
                SFX: 1
            }
        }
    });
    /*AudioChannel end.*/

    /*AudioLibrary start.*/
    Bridge.define("AudioLibrary", {
        inherits: [UnityEngine.ScriptableObject],
        fields: {
            clips: null,
            lookup: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "AudioLibrary#init", this ); }

                this.clips = new (System.Collections.Generic.List$1(AudioLibrary.ClipEntry)).ctor();
            }
        },
        methods: {
            /*AudioLibrary.Initialize start.*/
            Initialize: function () {
if ( TRACE ) { TRACE( "AudioLibrary#Initialize", this ); }

                var $t;
                this.lookup = new (System.Collections.Generic.Dictionary$2(System.String,AudioLibrary.ClipEntry)).ctor();
                $t = Bridge.getEnumerator(this.clips);
                try {
                    while ($t.moveNext()) {
                        var entry = $t.Current.$clone();
                        if (!this.lookup.containsKey(entry.key)) {
                            this.lookup.add(entry.key, entry.$clone());
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*AudioLibrary.Initialize end.*/

            /*AudioLibrary.TryGetClip start.*/
            TryGetClip: function (key, entry) {
if ( TRACE ) { TRACE( "AudioLibrary#TryGetClip", this ); }

                if (this.lookup == null) {
                    this.Initialize();
                }
                return this.lookup.tryGetValue(key, entry);
            },
            /*AudioLibrary.TryGetClip end.*/


        }
    });
    /*AudioLibrary end.*/

    /*AudioLibrary+ClipEntry start.*/
    Bridge.define("AudioLibrary.ClipEntry", {
        $kind: 1004,
        statics: {
            methods: {
                getDefaultValue: function () {
if ( TRACE ) { TRACE( "AudioLibrary.ClipEntry#getDefaultValue", this ); }
 return new AudioLibrary.ClipEntry(); }
            }
        },
        fields: {
            key: null,
            channel: 0,
            clip: null,
            volume: 0,
            loop: false
        },
        ctors: {
            ctor: function () {
if ( TRACE ) { TRACE( "AudioLibrary.ClipEntry#ctor", this ); }

                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
if ( TRACE ) { TRACE( "AudioLibrary.ClipEntry#getHashCode", this ); }

                var h = Bridge.addHash([3806190337, this.key, this.channel, this.clip, this.volume, this.loop]);
                return h;
            },
            equals: function (o) {
if ( TRACE ) { TRACE( "AudioLibrary.ClipEntry#equals", this ); }

                if (!Bridge.is(o, AudioLibrary.ClipEntry)) {
                    return false;
                }
                return Bridge.equals(this.key, o.key) && Bridge.equals(this.channel, o.channel) && Bridge.equals(this.clip, o.clip) && Bridge.equals(this.volume, o.volume) && Bridge.equals(this.loop, o.loop);
            },
            $clone: function (to) {
if ( TRACE ) { TRACE( "AudioLibrary.ClipEntry#$clone", this ); }

                var s = to || new AudioLibrary.ClipEntry();
                s.key = this.key;
                s.channel = this.channel;
                s.clip = this.clip;
                s.volume = this.volume;
                s.loop = this.loop;
                return s;
            }
        }
    });
    /*AudioLibrary+ClipEntry end.*/

    /*Core.Services.IAudioService start.*/
    Bridge.define("Core.Services.IAudioService", {
        $kind: 3
    });
    /*Core.Services.IAudioService end.*/

    /*BoardManager start.*/
    Bridge.define("BoardManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            slots: null,
            bricks: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "BoardManager#init", this ); }

                this.slots = new (System.Collections.Generic.List$1(GridSlot)).ctor();
                this.bricks = new (System.Collections.Generic.List$1(Brick)).ctor();
            }
        },
        methods: {
            /*BoardManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "BoardManager#Awake", this ); }

                BoardManager.Instance = this;
                this.slots.AddRange(UnityEngine.Object.FindObjectsOfType(GridSlot));
                this.bricks.AddRange(UnityEngine.Object.FindObjectsOfType(Brick));
            },
            /*BoardManager.Awake end.*/

            /*BoardManager.GetClosestSlot start.*/
            GetClosestSlot: function (pos) {
if ( TRACE ) { TRACE( "BoardManager#GetClosestSlot", this ); }

                var $t;
                var minDist = 3.40282347E+38;
                var closest = null;

                $t = Bridge.getEnumerator(this.slots);
                try {
                    while ($t.moveNext()) {
                        var slot = $t.Current;
                        var dist = pc.Vec3.distance( pos, slot.WorldPosition );
                        if (dist < minDist) {
                            minDist = dist;
                            closest = slot;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                return minDist < 1.0 ? closest : null;
            },
            /*BoardManager.GetClosestSlot end.*/

            /*BoardManager.GetSlotAtPosition start.*/
            GetSlotAtPosition: function (worldPos) {
if ( TRACE ) { TRACE( "BoardManager#GetSlotAtPosition", this ); }

                var $t;
                $t = Bridge.getEnumerator(this.slots);
                try {
                    while ($t.moveNext()) {
                        var slot = $t.Current;
                        if (pc.Vec3.distance( slot.WorldPosition, worldPos ) < 0.1) {
                            return slot;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                return null;
            },
            /*BoardManager.GetSlotAtPosition end.*/

            /*BoardManager.CheckAllBricks start.*/
            CheckAllBricks: function () {
if ( TRACE ) { TRACE( "BoardManager#CheckAllBricks", this ); }

                var $t;
                $t = Bridge.getEnumerator(this.bricks);
                try {
                    while ($t.moveNext()) {
                        var brick = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(brick, null) && brick.gameObject.activeInHierarchy) {
                            return;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                IterationVariantManagers.Instance.ShowEndCard(true);
            },
            /*BoardManager.CheckAllBricks end.*/

            /*BoardManager.CheckIfLastBricks start.*/
            CheckIfLastBricks: function () {
if ( TRACE ) { TRACE( "BoardManager#CheckIfLastBricks", this ); }

                var $t;
                if (UnityEngine.MonoBehaviour.op_Inequality(IterationVariantManagers.Instance, null) && !IterationVariantManagers.Instance.CanShowEndCardOnLastBricks()) {
                    return;
                }

                var activeBricks = 0;
                $t = Bridge.getEnumerator(this.bricks);
                try {
                    while ($t.moveNext()) {
                        var brick = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(brick, null) && brick.gameObject.activeInHierarchy) {
                            activeBricks = (activeBricks + 1) | 0;
                            if (activeBricks > 4) {
                                return;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                IterationVariantManagers.Instance.ShowEndCard(true);
            },
            /*BoardManager.CheckIfLastBricks end.*/


        }
    });
    /*BoardManager end.*/

    /*Brick start.*/
    Bridge.define("Brick", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            BrickColor: 0,
            brickColor: null,
            blockingLayers: null,
            gateBlockingLayers: null,
            blockCheckCells: 0,
            followSpeed: 0,
            maxDragStep: 0,
            snapDuration: 0,
            snapBackDuration: 0,
            rb: null,
            cam: null,
            isDragging: false,
            isAccepted: false,
            dragOffset: null,
            originalPosition: null,
            activeTween: null,
            occupiedSlots: null,
            releasedSlots: null,
            cells: null,
            brickMesh: null,
            highlight: null,
            meshOriginalLocalPos: null,
            meshTween: null,
            liftAmount: 0,
            liftDuration: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "Brick#init", this ); }

                this.brickColor = new UnityEngine.Color();
                this.blockingLayers = new UnityEngine.LayerMask();
                this.gateBlockingLayers = new UnityEngine.LayerMask();
                this.dragOffset = new UnityEngine.Vector3();
                this.originalPosition = new UnityEngine.Vector3();
                this.meshOriginalLocalPos = new UnityEngine.Vector3();
                this.blockCheckCells = 1;
                this.followSpeed = 32.0;
                this.maxDragStep = 0.55;
                this.snapDuration = 0.09;
                this.snapBackDuration = 0.08;
                this.isAccepted = false;
                this.occupiedSlots = new (System.Collections.Generic.List$1(GridSlot)).ctor();
                this.releasedSlots = new (System.Collections.Generic.List$1(GridSlot)).ctor();
                this.liftAmount = 1.0;
                this.liftDuration = 0.12;
            }
        },
        methods: {
            /*Brick.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "Brick#Awake", this ); }

                var $t;
                this.rb = this.GetComponent(UnityEngine.Rigidbody);
                this.cam = UnityEngine.Camera.main;
                this.cells = this.GetComponentsInChildren$1(BrickCell, true);
                $t = Bridge.getEnumerator(this.cells);
                try {
                    while ($t.moveNext()) {
                        var cell = $t.Current;
                        var local = cell.transform.localPosition.$clone();
                        cell.localGridPosition = new UnityEngine.Vector2Int.$ctor1(Math.round(local.x), Math.round(local.z));
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this.rb.interpolation = UnityEngine.RigidbodyInterpolation.Interpolate;
                this.rb.collisionDetectionMode = UnityEngine.CollisionDetectionMode.ContinuousDynamic;
                this.meshOriginalLocalPos = this.brickMesh.transform.localPosition.$clone();
                this.SetDraggingState(false);
                this.isAccepted = false;
            },
            /*Brick.Awake end.*/

            /*Brick.FixedUpdate start.*/
            FixedUpdate: function () {
if ( TRACE ) { TRACE( "Brick#FixedUpdate", this ); }

                if (!this.isDragging) {
                    return;
                }
                this.Dragging();
                this.CheckForGateWhileDragging();
            },
            /*Brick.FixedUpdate end.*/

            /*Brick.GetMouseWorld start.*/
            GetMouseWorld: function () {
if ( TRACE ) { TRACE( "Brick#GetMouseWorld", this ); }

                var ray = this.cam.ScreenPointToRay(UnityEngine.Input.mousePosition);
                var plane = new UnityEngine.Plane.$ctor2(pc.Vec3.UP.clone(), pc.Vec3.ZERO.clone());
                var dist = { };
                if (plane.Raycast(ray, dist)) {
                    return ray.GetPoint(dist.v);
                }
                return this.transform.position.$clone();
            },
            /*Brick.GetMouseWorld end.*/

            /*Brick.Dragging start.*/
            Dragging: function () {
if ( TRACE ) { TRACE( "Brick#Dragging", this ); }

                var target = this.GetMouseWorld().add( this.dragOffset );
                var delta = target.$clone().sub( this.rb.position );
                delta.y = 0.0;
                var maxStep = UnityEngine.Mathf.Min(this.followSpeed * UnityEngine.Time.fixedDeltaTime, this.maxDragStep);
                if (delta.lengthSq() < 0.0001) {
                    return;
                }
                if (delta.length() > maxStep) {
                    delta = delta.clone().normalize().$clone().clone().scale( maxStep );
                }
                var move = pc.Vec3.ZERO.clone();
                if (!this.IsBlocked(delta)) {
                    move = delta.$clone();
                } else {
                    var moveX = new pc.Vec3( delta.x, 0.0, 0.0 );
                    var moveZ = new pc.Vec3( 0.0, 0.0, delta.z );
                    var xFirst = Math.abs(delta.x) >= Math.abs(delta.z);
                    var primary = xFirst ? moveX.$clone() : moveZ.$clone();
                    var secondary = xFirst ? moveZ.$clone() : moveX.$clone();
                    if (!this.IsBlocked(primary)) {
                        move = primary.$clone();
                    } else {
                        if (!this.IsBlocked(secondary)) {
                            move = secondary.$clone();
                        }
                    }
                }
                this.rb.MovePosition(this.rb.position.$clone().add( move ));
            },
            /*Brick.Dragging end.*/

            /*Brick.CheckForGateWhileDragging start.*/
            CheckForGateWhileDragging: function () {
if ( TRACE ) { TRACE( "Brick#CheckForGateWhileDragging", this ); }

                var $t;
                $t = Bridge.getEnumerator(Gate.allGates);
                try {
                    while ($t.moveNext()) {
                        var gate = $t.Current;
                        if (gate.CanAccept(this) && !this.isAccepted) {
                            ControlManager.Instance.ForceRelease();
                            gate.Absorb(this);
                            this.isAccepted = true;
                            ScoreManager.Instance.AddScore(1);
                            break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*Brick.CheckForGateWhileDragging end.*/

            /*Brick.TrySnap start.*/
            TrySnap: function () {
if ( TRACE ) { TRACE( "Brick#TrySnap", this ); }

                var $t;
                var targetSlots = new (System.Collections.Generic.List$1(GridSlot)).ctor();
                $t = Bridge.getEnumerator(this.cells);
                try {
                    while ($t.moveNext()) {
                        var cell = $t.Current;
                        var slot = BoardManager.Instance.GetClosestSlot(cell.transform.position);
                        if (UnityEngine.MonoBehaviour.op_Equality(slot, null) || (slot.IsOccupied && UnityEngine.MonoBehaviour.op_Inequality(slot.occupyingBrick, this))) {
                            this.SnapBack();
                            return;
                        }
                        if (targetSlots.contains(slot)) {
                            this.SnapBack();
                            return;
                        }
                        targetSlots.add(slot);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this.SnapToSlots(targetSlots);
            },
            /*Brick.TrySnap end.*/

            /*Brick.SnapToSlots start.*/
            SnapToSlots: function (slots) {
if ( TRACE ) { TRACE( "Brick#SnapToSlots", this ); }

                this.KillTween();
                var targetPos = slots.getItem(0).WorldPosition.$clone();
                this.activeTween = DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, targetPos.$clone(), this.snapDuration), DG.Tweening.Ease.OutCubic), Bridge.fn.bind(this, function () {
                    var $t;
                    $t = Bridge.getEnumerator(slots);
                    try {
                        while ($t.moveNext()) {
                            var slot = $t.Current;
                            slot.SetOccupying(this);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                    this.occupiedSlots = slots;
                    this.releasedSlots.clear();
                }));
            },
            /*Brick.SnapToSlots end.*/

            /*Brick.SnapBack start.*/
            SnapBack: function () {
if ( TRACE ) { TRACE( "Brick#SnapBack", this ); }

                this.KillTween();
                this.activeTween = DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, this.originalPosition.$clone(), this.snapBackDuration), DG.Tweening.Ease.OutQuad), Bridge.fn.cacheBind(this, this.RestoreReleasedSlots));
            },
            /*Brick.SnapBack end.*/

            /*Brick.ClearSlots start.*/
            ClearSlots: function () {
if ( TRACE ) { TRACE( "Brick#ClearSlots", this ); }

                var $t;
                $t = Bridge.getEnumerator(this.occupiedSlots);
                try {
                    while ($t.moveNext()) {
                        var slot = $t.Current;
                        slot.Clear();
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this.occupiedSlots.clear();
            },
            /*Brick.ClearSlots end.*/

            /*Brick.CaptureReleasedSlots start.*/
            CaptureReleasedSlots: function () {
if ( TRACE ) { TRACE( "Brick#CaptureReleasedSlots", this ); }

                this.releasedSlots.clear();
                for (var i = 0; i < this.occupiedSlots.Count; i = (i + 1) | 0) {
                    if (UnityEngine.MonoBehaviour.op_Inequality(this.occupiedSlots.getItem(i), null)) {
                        this.releasedSlots.add(this.occupiedSlots.getItem(i));
                    }
                }
            },
            /*Brick.CaptureReleasedSlots end.*/

            /*Brick.RestoreReleasedSlots start.*/
            RestoreReleasedSlots: function () {
if ( TRACE ) { TRACE( "Brick#RestoreReleasedSlots", this ); }

                this.occupiedSlots.clear();
                for (var i = 0; i < this.releasedSlots.Count; i = (i + 1) | 0) {
                    var slot = this.releasedSlots.getItem(i);
                    if (UnityEngine.MonoBehaviour.op_Equality(slot, null)) {
                        continue;
                    }
                    if (slot.IsOccupied && UnityEngine.MonoBehaviour.op_Inequality(slot.occupyingBrick, this)) {
                        continue;
                    }
                    slot.SetOccupying(this);
                    this.occupiedSlots.add(slot);
                }
                this.releasedSlots.clear();
            },
            /*Brick.RestoreReleasedSlots end.*/

            /*Brick.KillTween start.*/
            KillTween: function () {
if ( TRACE ) { TRACE( "Brick#KillTween", this ); }

                if (this.activeTween != null && DG.Tweening.TweenExtensions.IsActive(this.activeTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.activeTween);
                }
            },
            /*Brick.KillTween end.*/

            /*Brick.SetDraggingState start.*/
            SetDraggingState: function (dragging) {
if ( TRACE ) { TRACE( "Brick#SetDraggingState", this ); }

                if (dragging) {
                    this.rb.interpolation = UnityEngine.RigidbodyInterpolation.None;
                    this.rb.constraints = 116;
                } else {
                    this.rb.velocity = pc.Vec3.ZERO.clone();
                    this.rb.interpolation = UnityEngine.RigidbodyInterpolation.Interpolate;
                    this.rb.constraints = 126;
                }
            },
            /*Brick.SetDraggingState end.*/

            /*Brick.IsBlocked start.*/
            IsBlocked: function (move) {
if ( TRACE ) { TRACE( "Brick#IsBlocked", this ); }

                var $t;
                if (pc.Vec3.equals( move, pc.Vec3.ZERO.clone() )) {
                    return false;
                }
                $t = Bridge.getEnumerator(this.cells);
                try {
                    while ($t.moveNext()) {
                        var cell = $t.Current;
                        if (cell.IsBlocked(move, this.blockingLayers, this.transform)) {
                            return true;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                return false;
            },
            /*Brick.IsBlocked end.*/

            /*Brick.RaiseMesh start.*/
            RaiseMesh: function () {
if ( TRACE ) { TRACE( "Brick#RaiseMesh", this ); }

                if (UnityEngine.Component.op_Equality(this.brickMesh, null)) {
                    return;
                }
                if (UnityEngine.Object.op_Implicit(this.highlight)) {
                    this.highlight.SetActive(true);
                }
                this.meshTween != null ? DG.Tweening.TweenExtensions.Kill(this.meshTween) : null;
                this.meshTween = DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.brickMesh.transform, this.meshOriginalLocalPos.y + this.liftAmount, this.liftDuration), DG.Tweening.Ease.OutCubic);
            },
            /*Brick.RaiseMesh end.*/

            /*Brick.ResetMeshPosition start.*/
            ResetMeshPosition: function () {
if ( TRACE ) { TRACE( "Brick#ResetMeshPosition", this ); }

                if (UnityEngine.Component.op_Equality(this.brickMesh, null)) {
                    return;
                }
                if (UnityEngine.Object.op_Implicit(this.highlight)) {
                    this.highlight.SetActive(false);
                }
                this.meshTween != null ? DG.Tweening.TweenExtensions.Kill(this.meshTween) : null;
                this.meshTween = DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.brickMesh.transform, this.meshOriginalLocalPos.y, this.liftDuration), DG.Tweening.Ease.OutCubic);
            },
            /*Brick.ResetMeshPosition end.*/

            /*Brick.Drag start.*/
            Drag: function () {
if ( TRACE ) { TRACE( "Brick#Drag", this ); }

                this.originalPosition = this.transform.position.$clone();
                this.dragOffset = this.transform.position.$clone().sub( this.GetMouseWorld() );
                this.isDragging = true;
                this.RaiseMesh();
                this.SetDraggingState(true);
                this.CaptureReleasedSlots();
                this.ClearSlots();
                this.KillTween();
                AudioManager.Instance.PlaySFX("Drag");
                Gate.StartBounceMatchingGates(this.brickColor);
            },
            /*Brick.Drag end.*/

            /*Brick.Drop start.*/
            Drop: function () {
if ( TRACE ) { TRACE( "Brick#Drop", this ); }

                this.isDragging = false;
                this.ResetMeshPosition();
                this.SetDraggingState(false);
                this.TrySnap();
                AudioManager.Instance.PlaySFX("Drop");
                Gate.StopBounceMatchingGates(this.brickColor);
            },
            /*Brick.Drop end.*/

            /*Brick.GetOccupiedSlots start.*/
            GetOccupiedSlots: function () {
if ( TRACE ) { TRACE( "Brick#GetOccupiedSlots", this ); }

                return this.occupiedSlots;
            },
            /*Brick.GetOccupiedSlots end.*/

            /*Brick.RegisterInitialSlot start.*/
            RegisterInitialSlot: function (slot) {
if ( TRACE ) { TRACE( "Brick#RegisterInitialSlot", this ); }

                if (!this.occupiedSlots.contains(slot)) {
                    this.occupiedSlots.add(slot);
                }
            },
            /*Brick.RegisterInitialSlot end.*/

            /*Brick.DisablePhysics start.*/
            DisablePhysics: function () {
if ( TRACE ) { TRACE( "Brick#DisablePhysics", this ); }

                this.ClearSlots();
                this.rb.isKinematic = true;
                this.rb.detectCollisions = false;
            },
            /*Brick.DisablePhysics end.*/

            /*Brick.IsBlockedInDirection start.*/
            IsBlockedInDirection: function (direction) {
if ( TRACE ) { TRACE( "Brick#IsBlockedInDirection", this ); }

                direction.y = 0.0;
                if (direction.lengthSq() < 0.0001) {
                    return false;
                }
                var unit = direction.clone().normalize().$clone();
                var distance = UnityEngine.Mathf.Max(1, this.blockCheckCells);
                for (var i = 0; i < this.cells.length; i = (i + 1) | 0) {
                    for (var d = 1; d <= distance; d = (d + 1) | 0) {
                        if (this.cells[i].IsNeighborBlocked(unit.$clone().clone().scale( d ), this.gateBlockingLayers, this.transform)) {
                            return true;
                        }
                    }
                }
                return false;
            },
            /*Brick.IsBlockedInDirection end.*/


        }
    });
    /*Brick end.*/

    /*BrickCell start.*/
    Bridge.define("BrickCell", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            localGridPosition: null,
            col: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "BrickCell#init", this ); }

                this.localGridPosition = new UnityEngine.Vector2Int();
            }
        },
        methods: {
            /*BrickCell.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "BrickCell#Awake", this ); }

                this.col = this.GetComponent(UnityEngine.Collider);
            },
            /*BrickCell.Awake end.*/

            /*BrickCell.IsBlocked start.*/
            IsBlocked: function (move, blockingLayers, root) {
if ( TRACE ) { TRACE( "BrickCell#IsBlocked", this ); }

                if (pc.Vec3.equals( move, pc.Vec3.ZERO.clone() )) {
                    return false;
                }
                var destCenter = this.col.bounds.center.$clone().add( move );
                var halfExtents = this.col.bounds.halfExtents.$clone().clone().scale( 0.99 );
                var hits = UnityEngine.Physics.OverlapBox$1(destCenter, halfExtents, pc.Quat.IDENTITY.clone(), UnityEngine.LayerMask.op_Implicit(blockingLayers.$clone()), UnityEngine.QueryTriggerInteraction.Ignore);
                for (var i = 0; i < hits.length; i = (i + 1) | 0) {
                    var hitCol = hits[i];
                    if (UnityEngine.Component.op_Equality(hitCol, null)) {
                        continue;
                    }
                    if (hitCol.transform.IsChildOf(root)) {
                        continue;
                    }
                    return true;
                }
                return false;
            },
            /*BrickCell.IsBlocked end.*/

            /*BrickCell.IsNeighborBlocked start.*/
            IsNeighborBlocked: function (step, blockingLayers, root) {
if ( TRACE ) { TRACE( "BrickCell#IsNeighborBlocked", this ); }

                if (pc.Vec3.equals( step, pc.Vec3.ZERO.clone() )) {
                    return false;
                }
                var checkPos = this.col.bounds.center.$clone().add( step );
                var halfExtents = this.col.bounds.halfExtents.$clone().clone().scale( 0.5 );
                var hits = UnityEngine.Physics.OverlapBox$1(checkPos, halfExtents, pc.Quat.IDENTITY.clone(), UnityEngine.LayerMask.op_Implicit(blockingLayers.$clone()), UnityEngine.QueryTriggerInteraction.Ignore);
                for (var i = 0; i < hits.length; i = (i + 1) | 0) {
                    var c = hits[i];
                    if (UnityEngine.Component.op_Equality(c, null)) {
                        continue;
                    }
                    if (c.transform.IsChildOf(root)) {
                        continue;
                    }
                    return true;
                }
                return false;
            },
            /*BrickCell.IsNeighborBlocked end.*/


        }
    });
    /*BrickCell end.*/

    /*BrickColor start.*/
    Bridge.define("BrickColor", {
        $kind: 6,
        statics: {
            fields: {
                Red: 0,
                Green: 1,
                Blue: 2,
                Yellow: 3
            }
        }
    });
    /*BrickColor end.*/

    /*CameraFitter start.*/
    Bridge.define("CameraFitter", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            baseOrthoSize: 0,
            phoneReferenceAspect: 0,
            tabletReferenceAspect: 0,
            tabletAspectThreshold: 0,
            minOrthoSize: 0,
            maxOrthoSize: 0,
            tabletMinOrthoSize: 0,
            tabletMaxOrthoSize: 0,
            landscapeFitByHeight: false,
            uiScale: null,
            targetCamera: null,
            lastScreenWidth: 0,
            lastScreenHeight: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "CameraFitter#init", this ); }

                this.baseOrthoSize = 13.6;
                this.phoneReferenceAspect = 0.5625;
                this.tabletReferenceAspect = 0.75;
                this.tabletAspectThreshold = 0.65;
                this.minOrthoSize = 10.0;
                this.maxOrthoSize = 18.0;
                this.tabletMinOrthoSize = 10.0;
                this.tabletMaxOrthoSize = 18.0;
                this.landscapeFitByHeight = true;
            }
        },
        methods: {
            /*CameraFitter.Awake start.*/
            /**
             * Caches the Camera component.
             *
             * @instance
             * @private
             * @this CameraFitter
             * @memberof CameraFitter
             * @return  {void}
             */
            Awake: function () {
if ( TRACE ) { TRACE( "CameraFitter#Awake", this ); }

                this.targetCamera = this.GetComponent(UnityEngine.Camera);
            },
            /*CameraFitter.Awake end.*/

            /*CameraFitter.Start start.*/
            /**
             * Applies the initial fit on scene start.
             *
             * @instance
             * @private
             * @this CameraFitter
             * @memberof CameraFitter
             * @return  {void}
             */
            Start: function () {
if ( TRACE ) { TRACE( "CameraFitter#Start", this ); }

                this.ApplyFit();
            },
            /*CameraFitter.Start end.*/

            /*CameraFitter.Update start.*/
            /**
             * Re-applies the fit whenever the screen resolution changes.
             *
             * @instance
             * @private
             * @this CameraFitter
             * @memberof CameraFitter
             * @return  {void}
             */
            Update: function () {
if ( TRACE ) { TRACE( "CameraFitter#Update", this ); }

                if (UnityEngine.Screen.width !== this.lastScreenWidth || UnityEngine.Screen.height !== this.lastScreenHeight) {
                    this.ApplyFit();
                }
            },
            /*CameraFitter.Update end.*/

            /*CameraFitter.ApplyFit start.*/
            /**
             * Computes and applies the orthographic size for the current screen aspect.
             *
             * @instance
             * @private
             * @this CameraFitter
             * @memberof CameraFitter
             * @return  {void}
             */
            ApplyFit: function () {
if ( TRACE ) { TRACE( "CameraFitter#ApplyFit", this ); }

                this.lastScreenWidth = UnityEngine.Screen.width;
                this.lastScreenHeight = UnityEngine.Screen.height;

                if (UnityEngine.Component.op_Equality(this.targetCamera, null)) {
                    return;
                }

                var currentAspect = UnityEngine.Screen.width / UnityEngine.Screen.height;
                var isPortrait = currentAspect < 1.0;

                var portraitAspect = isPortrait ? currentAspect : 1.0 / currentAspect;
                var isTablet = portraitAspect >= this.tabletAspectThreshold;
                var activeReferenceAspect = isTablet ? this.tabletReferenceAspect : this.phoneReferenceAspect;

                var newSize;

                if (isPortrait || !this.landscapeFitByHeight) {
                    newSize = this.baseOrthoSize * (activeReferenceAspect / currentAspect);
                } else {
                    newSize = this.baseOrthoSize;
                }

                if (!isTablet) {
                    this.uiScale[0].localScale = new pc.Vec3( 8.0, 6.0, 8.0 );
                    this.uiScale[1].localScale = new pc.Vec3( 0.03, 0.03, 0.03 );
                    this.uiScale[2].localScale = new pc.Vec3( 0.03, 0.03, 0.03 );
                    this.uiScale[1].position = new pc.Vec3( -5, 20, 2 );
                    this.uiScale[2].position = new pc.Vec3( 0, 35, 0 );
                } else {
                    this.uiScale[0].localScale = new pc.Vec3( 8.0, 6.0, 8.0 );
                    this.uiScale[1].localScale = new pc.Vec3( 0.02, 0.02, 0.02 );
                    this.uiScale[2].localScale = new pc.Vec3( 0.02, 0.02, 0.02 );
                    this.uiScale[1].position = new pc.Vec3( -5, 17, 2 );
                    this.uiScale[2].position = new pc.Vec3( 0, 25, 0 );
                }

                var clampMin = isTablet ? this.tabletMinOrthoSize : this.minOrthoSize;
                var clampMax = isTablet ? this.tabletMaxOrthoSize : this.maxOrthoSize;
                newSize = Math.max(clampMin, Math.min(newSize, clampMax));

                this.targetCamera.orthographicSize = newSize;
            },
            /*CameraFitter.ApplyFit end.*/


        }
    });
    /*CameraFitter end.*/

    /*CameraManager start.*/
    Bridge.define("CameraManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            cam: null,
            IsPan: false,
            PanLayer: null,
            PanAxis: 0,
            originVector: null,
            panTarget: null,
            lastInputPos: null,
            mouseDownPos: null,
            panSensitivity: 0,
            clickPanDuration: 0,
            clickPanThreshold: 0,
            distanceClamp: 0,
            isPannable: false,
            isPanning: false,
            panTween: null,
            IsZoom: false,
            zoomIn: 0,
            zoomOut: 0,
            zoomSensitivity: 0,
            isZoomable: false,
            isZooming: false,
            zoomTween: null,
            IsShake: false,
            shakeTime: 0,
            shakeIntensity: 0,
            shakeRandomness: 0,
            shakeVibrato: 0,
            shakeTween: null,
            IsAnimation: false,
            animationSteps: null,
            animationDuration: 0,
            animationZoom: 0,
            currentAnimationIndex: 0,
            animationEase: 0,
            animationTween: null,
            IsAnimationSeq: false,
            animationSeqSteps: null,
            animationSeqEase: 0,
            animationSeqTween: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "CameraManager#init", this ); }

                this.PanLayer = new UnityEngine.LayerMask();
                this.originVector = new UnityEngine.Vector3();
                this.panTarget = new UnityEngine.Vector3();
                this.lastInputPos = new UnityEngine.Vector3();
                this.mouseDownPos = new UnityEngine.Vector3();
                this.PanAxis = PanAxis.XY;
                this.originVector = new pc.Vec3( 0, 0, 0 );
                this.panSensitivity = 5.0;
                this.clickPanDuration = 0.3;
                this.clickPanThreshold = 2.0;
                this.distanceClamp = 100.0;
                this.zoomIn = 10.0;
                this.zoomOut = 60.0;
                this.zoomSensitivity = 0.01;
                this.shakeTime = 0.2;
                this.shakeIntensity = 0.5;
                this.shakeRandomness = 90.0;
                this.shakeVibrato = 20;
                this.animationDuration = 1.0;
                this.animationZoom = 25.0;
                this.currentAnimationIndex = 0;
                this.animationEase = DG.Tweening.Ease.InOutSine;
                this.animationSeqEase = DG.Tweening.Ease.InOutSine;
            }
        },
        methods: {
            /*CameraManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "CameraManager#Awake", this ); }

                CameraManager.Instance = this;
                this.cam = this.GetComponent(UnityEngine.Camera);
                this.panTarget = this.transform.position.$clone();
            },
            /*CameraManager.Awake end.*/

            /*CameraManager.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "CameraManager#Start", this ); }

                this.AnimateSeq();
                this.isPannable = true;
                this.isZoomable = true;
            },
            /*CameraManager.Start end.*/

            /*CameraManager.Update start.*/
            Update: function () {
if ( TRACE ) { TRACE( "CameraManager#Update", this ); }

                this.SmoothPan();
                this.HandleZoom();
            },
            /*CameraManager.Update end.*/

            /*CameraManager.SmoothPan start.*/
            SmoothPan: function () {
if ( TRACE ) { TRACE( "CameraManager#SmoothPan", this ); }

                if (!this.IsPan || !this.isPannable || this.isZooming) {
                    return;
                }
                if (ControlManager.Instance.IsHolding) {
                    this.isPanning = false;
                    if (this.panTween != null && DG.Tweening.TweenExtensions.IsActive(this.panTween)) {
                        DG.Tweening.TweenExtensions.Kill(this.panTween);
                        this.panTarget = this.transform.position.$clone();
                    }
                    return;
                }
                if (UnityEngine.Input.GetMouseButtonDown(0)) {
                    this.isPanning = true;
                    this.mouseDownPos = UnityEngine.Input.mousePosition.$clone();
                    this.lastInputPos = this.mouseDownPos.$clone();
                    if (this.panTween != null && DG.Tweening.TweenExtensions.IsActive(this.panTween)) {
                        DG.Tweening.TweenExtensions.Kill(this.panTween);
                    }
                }
                if (this.isPanning && UnityEngine.Input.GetMouseButton(0)) {
                    var delta = UnityEngine.Input.mousePosition.$clone().sub( this.lastInputPos );
                    var moveDir = this.GetPanDirection(new pc.Vec2( -delta.x, -delta.y ));
                    var move = moveDir.$clone().clone().scale( this.panSensitivity ).clone().scale( UnityEngine.Time.deltaTime );
                    this.panTarget = this.panTarget.$clone().add( move.$clone() );
                    this.panTarget.x = Math.max(-this.distanceClamp, Math.min(this.panTarget.x, this.distanceClamp));
                    this.panTarget.y = Math.max(-this.distanceClamp, Math.min(this.panTarget.y, this.distanceClamp));
                    this.panTarget.z = Math.max(-this.distanceClamp, Math.min(this.panTarget.z, this.distanceClamp));
                    this.transform.position = new pc.Vec3().lerp( this.transform.position, this.panTarget, 1.0 - UnityEngine.Mathf.Exp(-20.0 * UnityEngine.Time.deltaTime) );
                    this.lastInputPos = UnityEngine.Input.mousePosition.$clone();
                }
                if (UnityEngine.Input.GetMouseButtonUp(0)) {
                    var totalDrag = (UnityEngine.Input.mousePosition.$clone().sub( this.mouseDownPos )).length();
                    if (totalDrag < this.clickPanThreshold && !this.isZooming) {
                        this.PanToClick(UnityEngine.Input.mousePosition.$clone());
                    }
                    this.isPanning = false;
                }
            },
            /*CameraManager.SmoothPan end.*/

            /*CameraManager.PanToClick start.*/
            PanToClick: function (mousePos) {
if ( TRACE ) { TRACE( "CameraManager#PanToClick", this ); }

                var viewport = this.cam.ScreenToViewportPoint(mousePos);
                var offset = new pc.Vec2( viewport.x - 0.5, viewport.y - 0.5 );
                var distance = offset.length();
                if (distance < 0.05) {
                    return;
                }
                var normalized = Math.max(0, Math.min(1, distance / 0.5));
                var strengthFactor = Math.pow(normalized, 2.5);
                var dir = offset.clone().normalize().$clone();
                var moveDir = this.GetPanDirection(dir);
                var maxClickPanDistance = 20.0;
                var move = moveDir.$clone().clone().scale( maxClickPanDistance ).clone().scale( strengthFactor );
                this.panTarget = this.panTarget.$clone().add( move.$clone() );
                this.panTarget.x = Math.max(-this.distanceClamp, Math.min(this.panTarget.x, this.distanceClamp));
                this.panTarget.y = Math.max(-this.distanceClamp, Math.min(this.panTarget.y, this.distanceClamp));
                this.panTarget.z = Math.max(-this.distanceClamp, Math.min(this.panTarget.z, this.distanceClamp));
                if (this.panTween != null && DG.Tweening.TweenExtensions.IsActive(this.panTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.panTween);
                }
                this.panTween = DG.Tweening.TweenSettingsExtensions.SetUpdate(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, this.panTarget.$clone(), this.clickPanDuration), DG.Tweening.Ease.OutCubic), true);
            },
            /*CameraManager.PanToClick end.*/

            /*CameraManager.GetPanDirection start.*/
            GetPanDirection: function (input) {
if ( TRACE ) { TRACE( "CameraManager#GetPanDirection", this ); }

                var right = this.cam.transform.right.$clone();
                var up = this.cam.transform.up.$clone();
                var forward = this.cam.transform.forward.$clone();
                var result = pc.Vec3.ZERO.clone();
                switch (this.PanAxis) {
                    case PanAxis.XY: 
                        right.z = 0.0;
                        up.z = 0.0;
                        if (right.lengthSq() > 0) {
                            right.normalize();
                        }
                        if (up.lengthSq() > 0) {
                            up.normalize();
                        }
                        result = right.$clone().clone().scale( input.x ).add( up.$clone().clone().scale( input.y ) );
                        break;
                    case PanAxis.XZ: 
                        right.y = 0.0;
                        forward.y = 0.0;
                        if (right.lengthSq() > 0) {
                            right.normalize();
                        }
                        if (forward.lengthSq() > 0) {
                            forward.normalize();
                        }
                        result = right.$clone().clone().scale( input.x ).add( forward.$clone().clone().scale( input.y ) );
                        break;
                    case PanAxis.YZ: 
                        forward.x = 0.0;
                        up.x = 0.0;
                        if (forward.lengthSq() > 0) {
                            forward.normalize();
                        }
                        if (up.lengthSq() > 0) {
                            up.normalize();
                        }
                        result = forward.$clone().clone().scale( input.x ).add( up.$clone().clone().scale( input.y ) );
                        break;
                }
                return result.$clone();
            },
            /*CameraManager.GetPanDirection end.*/

            /*CameraManager.HandleZoom start.*/
            HandleZoom: function () {
if ( TRACE ) { TRACE( "CameraManager#HandleZoom", this ); }

                if (!this.IsZoom || !this.isZoomable || ControlManager.Instance.IsHolding) {
                    return;
                }
                if (UnityEngine.Input.touchCount === 2) {
                    this.isZooming = true;
                    if (this.panTween != null && DG.Tweening.TweenExtensions.IsActive(this.panTween)) {
                        DG.Tweening.TweenExtensions.Kill(this.panTween);
                    }
                    var touchZero = UnityEngine.Input.GetTouch(0);
                    var touchOne = UnityEngine.Input.GetTouch(1);
                    var touchZeroPrevPos = touchZero.position.$clone().sub( touchZero.deltaPosition );
                    var touchOnePrevPos = touchOne.position.$clone().sub( touchOne.deltaPosition );
                    var prevTouchDeltaMag = (touchZeroPrevPos.$clone().sub( touchOnePrevPos )).length();
                    var touchDeltaMag = (touchZero.position.$clone().sub( touchOne.position )).length();
                    var deltaMagnitudeDiff = prevTouchDeltaMag - touchDeltaMag;
                    if (this.cam.orthographic) {
                        this.cam.orthographicSize += deltaMagnitudeDiff * this.zoomSensitivity;
                        this.cam.orthographicSize = Math.max(this.zoomIn, Math.min(this.cam.orthographicSize, this.zoomOut));
                    } else {
                        this.cam.fieldOfView += deltaMagnitudeDiff * this.zoomSensitivity;
                        this.cam.fieldOfView = Math.max(this.zoomIn, Math.min(this.cam.fieldOfView, this.zoomOut));
                    }
                } else {
                    if (this.isZooming && UnityEngine.Input.touchCount === 0) {
                        this.isZooming = false;
                    }
                }
            },
            /*CameraManager.HandleZoom end.*/

            /*CameraManager.DOZoom start.*/
            DOZoom: function (target, duration, ease) {
if ( TRACE ) { TRACE( "CameraManager#DOZoom", this ); }

                if (this.cam.orthographic) {
                    return DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), DG.Tweening.DOTween.To$4(Bridge.fn.bind(this, function () {
                        return this.cam.orthographicSize;
                    }), Bridge.fn.bind(this, function (x) {
                        this.cam.orthographicSize = x;
                    }), target, duration), ease);
                } else {
                    return DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), DG.Tweening.DOTween.To$4(Bridge.fn.bind(this, function () {
                        return this.cam.fieldOfView;
                    }), Bridge.fn.bind(this, function (x) {
                        this.cam.fieldOfView = x;
                    }), target, duration), ease);
                }
            },
            /*CameraManager.DOZoom end.*/

            /*CameraManager.KillTweens start.*/
            KillTweens: function () {
if ( TRACE ) { TRACE( "CameraManager#KillTweens", this ); }

                this.isPannable = false;
                this.isPanning = false;
                this.isZoomable = false;
                this.isZooming = false;
                if (this.panTween != null && DG.Tweening.TweenExtensions.IsActive(this.panTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.panTween);
                }
                if (this.zoomTween != null && DG.Tweening.TweenExtensions.IsActive(this.zoomTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.zoomTween);
                }
                if (this.shakeTween != null && DG.Tweening.TweenExtensions.IsActive(this.shakeTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.shakeTween);
                }
                if (this.animationTween != null && DG.Tweening.TweenExtensions.IsActive(this.animationTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.animationTween);
                }
                if (this.animationSeqTween != null && DG.Tweening.TweenExtensions.IsActive(this.animationSeqTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.animationSeqTween);
                }
            },
            /*CameraManager.KillTweens end.*/

            /*CameraManager.Shake start.*/
            Shake: function () {
if ( TRACE ) { TRACE( "CameraManager#Shake", this ); }

                this.Shake$1(this.shakeTime, this.shakeIntensity);
            },
            /*CameraManager.Shake end.*/

            /*CameraManager.Shake$1 start.*/
            Shake$1: function (duration, strength) {
if ( TRACE ) { TRACE( "CameraManager#Shake$1", this ); }

                if (!this.IsShake) {
                    return;
                }
                if (this.shakeTween != null && DG.Tweening.TweenExtensions.IsActive(this.shakeTween)) {
                    DG.Tweening.TweenExtensions.Kill(this.shakeTween);
                }
                this.shakeTween = DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.OnUpdate(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetUpdate(DG.Tweening.Tweener, DG.Tweening.ShortcutExtensions.DOShakePosition$2(this.transform, duration, strength, this.shakeVibrato, this.shakeRandomness, false, true, 0), true), Bridge.fn.bind(this, function () {
                    this.transform.position = this.panTarget.$clone().add( (this.transform.position.$clone().sub( this.panTarget )) );
                })), Bridge.fn.bind(this, function () {
                    this.transform.position = this.panTarget.$clone();
                }));
            },
            /*CameraManager.Shake$1 end.*/

            /*CameraManager.AnimateReturn start.*/
            AnimateReturn: function () {
if ( TRACE ) { TRACE( "CameraManager#AnimateReturn", this ); }

                ControlManager.Instance.IsGameLocked = true;
                this.KillTweens();
                this.animationTween = DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.OnUpdate(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.SetUpdate(DG.Tweening.Sequence, DG.Tweening.DOTween.Sequence(), true), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, this.originVector.$clone(), this.animationDuration), this.animationEase)), this.DOZoom(this.animationZoom, this.animationDuration, this.animationEase)), Bridge.fn.bind(this, function () {
                    this.panTarget = this.transform.position.$clone();
                })), Bridge.fn.bind(this, function () {
                    this.panTarget = this.originVector.$clone();
                    this.isPannable = true;
                    this.isZoomable = true;
                    ControlManager.Instance.IsGameLocked = false;
                }));
            },
            /*CameraManager.AnimateReturn end.*/

            /*CameraManager.Animate start.*/
            Animate: function () {
if ( TRACE ) { TRACE( "CameraManager#Animate", this ); }

                if (!this.IsAnimation || this.animationSteps == null || this.animationSteps.length === 0) {
                    return;
                }
                ControlManager.Instance.IsGameLocked = true;
                this.KillTweens();
                var step = this.animationSteps[this.currentAnimationIndex].$clone();
                var duration = step.duration > 0 ? step.duration : this.animationDuration;
                var zoom = step.zoom > 0 ? step.zoom : this.animationZoom;
                var targetPos = step.target.$clone();
                this.animationTween = DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.SetUpdate(DG.Tweening.Sequence, DG.Tweening.DOTween.Sequence(), true), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, targetPos.$clone(), duration), this.animationEase)), this.DOZoom(zoom, duration, this.animationEase)), Bridge.fn.bind(this, function () {
                    this.panTarget = targetPos.$clone();
                    this.isPannable = true;
                    this.isZoomable = true;
                    ControlManager.Instance.IsGameLocked = false;
                }));
                this.currentAnimationIndex = (this.currentAnimationIndex + 1) | 0;
                if (this.currentAnimationIndex >= this.animationSteps.length) {
                    this.currentAnimationIndex = 0;
                }
            },
            /*CameraManager.Animate end.*/

            /*CameraManager.AnimateSeq start.*/
            AnimateSeq: function () {
if ( TRACE ) { TRACE( "CameraManager#AnimateSeq", this ); }

                if (!this.IsAnimationSeq || this.animationSeqSteps == null || this.animationSeqSteps.length === 0) {
                    return;
                }
                ControlManager.Instance.IsGameLocked = true;
                this.KillTweens();
                var seq = DG.Tweening.TweenSettingsExtensions.SetUpdate(DG.Tweening.Sequence, DG.Tweening.DOTween.Sequence(), true);
                for (var i = 0; i < this.animationSeqSteps.length; i = (i + 1) | 0) {
                    var step = this.animationSeqSteps[i].$clone();
                    var duration = step.duration > 0 ? step.duration : this.animationDuration;
                    var pause = step.pause;
                    var ease = step.ease === DG.Tweening.Ease.Unset ? this.animationSeqEase : step.ease;
                    var zoom = step.zoom > 0 ? step.zoom : this.animationZoom;
                    var target = { v : step.target.$clone() };
                    DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.DOTween.Sequence(), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.transform, target.v.$clone(), duration), ease)), this.DOZoom(zoom, duration, ease)));
                    DG.Tweening.TweenSettingsExtensions.AppendCallback(seq, (function ($me, target) {
                        return Bridge.fn.bind($me, function () {
                            this.panTarget = target.v.$clone();
                        });
                    })(this, target));
                    if (pause > 0) {
                        DG.Tweening.TweenSettingsExtensions.AppendInterval(seq, pause);
                    }
                }
                DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, seq, Bridge.fn.bind(this, function () {
                    this.isPannable = true;
                    this.isZoomable = true;
                    ControlManager.Instance.IsGameLocked = false;
                }));
                this.animationSeqTween = seq;
            },
            /*CameraManager.AnimateSeq end.*/


        },
        overloads: {
            "Shake(float, float)": "Shake$1"
        }
    });
    /*CameraManager end.*/

    /*ClickCounter start.*/
    Bridge.define("ClickCounter", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        methods: {
            /*ClickCounter.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "ClickCounter#Awake", this ); }

                ClickCounter.Instance = this;
            },
            /*ClickCounter.Awake end.*/

            /*ClickCounter.Initialize start.*/
            Initialize: function (clicks) {
if ( TRACE ) { TRACE( "ClickCounter#Initialize", this ); }
 },
            /*ClickCounter.Initialize end.*/

            /*ClickCounter.RegisterClick start.*/
            RegisterClick: function () {
if ( TRACE ) { TRACE( "ClickCounter#RegisterClick", this ); }

                if (UnityEngine.MonoBehaviour.op_Inequality(IterationVariantManagers.Instance, null)) {
                    IterationVariantManagers.Instance.RegisterClick();
                }
            },
            /*ClickCounter.RegisterClick end.*/


        }
    });
    /*ClickCounter end.*/

    /*ControlManager start.*/
    Bridge.define("ControlManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            controlLayer: null,
            deactivate: null,
            activate: null,
            IsGameLocked: false,
            IsHolding: false,
            selectedGameObject: null,
            isStarted: false
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "ControlManager#init", this ); }

                this.controlLayer = new UnityEngine.LayerMask();
                this.IsGameLocked = false;
                this.IsHolding = false;
                this.isStarted = false;
            }
        },
        methods: {
            /*ControlManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "ControlManager#Awake", this ); }

                ControlManager.Instance = this;
                this.IsGameLocked = false;
                this.selectedGameObject = null;
            },
            /*ControlManager.Awake end.*/

            /*ControlManager.Update start.*/
            Update: function () {
if ( TRACE ) { TRACE( "ControlManager#Update", this ); }

                if (this.IsGameLocked) {
                    return;
                }
                if (UnityEngine.Input.GetMouseButtonDown(0)) {
                    AudioManager.Instance.PlaySFX("Click");
                    var ray = UnityEngine.Camera.main.ScreenPointToRay(UnityEngine.Input.mousePosition);
                    var hit = { v : new UnityEngine.RaycastHit() };
                    if (UnityEngine.Physics.Raycast$1(ray, hit, 200.0, UnityEngine.LayerMask.op_Implicit(this.controlLayer.$clone()))) {
                        if (UnityEngine.Component.op_Inequality(hit.v.collider, null) && !UnityEngine.Object.op_Implicit(this.selectedGameObject)) {
                            var brick = hit.v.collider.GetComponentInParent(Brick);
                            if (UnityEngine.MonoBehaviour.op_Equality(brick, null)) {
                                return;
                            }

                            this.ControllersManagers();
                            if (this.IsGameLocked) {
                                return;
                            }

                            this.selectedGameObject = hit.v.collider.gameObject;
                            this.IsHolding = true;
                            brick.Drag();
                        }
                    }
                }
                if (UnityEngine.Input.GetMouseButtonUp(0)) {
                    if (UnityEngine.Object.op_Implicit(this.selectedGameObject)) {
                        if (UnityEngine.Object.op_Implicit(this.selectedGameObject.GetComponentInParent(Brick))) {
                            GameManager.Instance.StartHint();
                            this.selectedGameObject.GetComponentInParent(Brick).Drop();
                            //CameraManager.Instance.Shake(0.1f, 0.1f);
                            BoardManager.Instance.CheckIfLastBricks();
                        }
                        this.selectedGameObject = null;
                        this.IsHolding = false;
                    }
                }
            },
            /*ControlManager.Update end.*/

            /*ControlManager.ControllersManagers start.*/
            ControllersManagers: function () {
if ( TRACE ) { TRACE( "ControlManager#ControllersManagers", this ); }

                var $t, $t1;
                IterationVariantManagers.Instance.ApplyIterationAndVariantMode();
                IterationVariantManagers.Instance.StartIteration();
                IterationVariantManagers.Instance.RegisterClick();
                if (this.IsGameLocked) {
                    return;
                }
                ScoreManager.Instance.AddScore(0);
                AudioManager.Instance.PlayMusic("BgMusic");
                GameManager.Instance.StopHint();
                if (!this.isStarted) {
                    Luna.Unity.Analytics.LogEvent(Luna.Unity.Analytics.EventType.LevelStart);
                    $t = Bridge.getEnumerator(this.deactivate);
                    try {
                        while ($t.moveNext()) {
                            var off = $t.Current;
                            off.SetActive(false);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                    $t1 = Bridge.getEnumerator(this.activate);
                    try {
                        while ($t1.moveNext()) {
                            var on = $t1.Current;
                            on.SetActive(true);
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$Dispose();
                        }
                    }
                    this.isStarted = true;
                }
            },
            /*ControlManager.ControllersManagers end.*/

            /*ControlManager.ForceRelease start.*/
            ForceRelease: function () {
if ( TRACE ) { TRACE( "ControlManager#ForceRelease", this ); }

                if (UnityEngine.Object.op_Implicit(this.selectedGameObject) && this.IsGameLocked) {
                    DG.Tweening.DOVirtual.DelayedCall(0.1, Bridge.fn.bind(this, function () {
                        if (UnityEngine.Object.op_Implicit(this.selectedGameObject)) {
                            if (UnityEngine.Object.op_Implicit(this.selectedGameObject.GetComponentInParent(Brick))) {
                                this.selectedGameObject.GetComponentInParent(Brick).Drop();
                            }
                        }
                        this.selectedGameObject = null;
                        this.IsHolding = false;
                        GameManager.Instance.StartHint();
                    }));
                }
                if (UnityEngine.Object.op_Implicit(this.selectedGameObject) && !this.IsGameLocked) {
                    this.selectedGameObject = null;
                    this.IsHolding = false;
                    GameManager.Instance.StartHint();
                }
            },
            /*ControlManager.ForceRelease end.*/


        }
    });
    /*ControlManager end.*/

    /*Core.Services.ServicesLocator start.*/
    Bridge.define("Core.Services.ServicesLocator", {
        statics: {
            fields: {
                _services: null
            },
            ctors: {
                init: function () {
if ( TRACE ) { TRACE( "Core.Services.ServicesLocator#init", this ); }

                    this._services = new (System.Collections.Generic.Dictionary$2(System.Type,System.Object)).ctor();
                }
            },
            methods: {
                /*Core.Services.ServicesLocator.Register:static start.*/
                /**
                 * Registers a service instance
                 *
                 * @static
                 * @public
                 * @this Core.Services.ServicesLocator
                 * @memberof Core.Services.ServicesLocator
                 * @param   {Function}    T          
                 * @param   {T}           service
                 * @return  {void}
                 */
                Register: function (T, service) {
if ( TRACE ) { TRACE( "Core.Services.ServicesLocator#Register", this ); }

                    var type = T;
                    if (Core.Services.ServicesLocator._services.containsKey(type)) {
                        UnityEngine.Debug.LogWarning$1(System.String.format("Service of type {0} is already registered. Replacing.", [type]));
                    }
                    Core.Services.ServicesLocator._services.setItem(type, Bridge.rValue(service));
                },
                /*Core.Services.ServicesLocator.Register:static end.*/

                /*Core.Services.ServicesLocator.Get:static start.*/
                /**
                 * Get Registered service. Throw if not found
                 *
                 * @static
                 * @public
                 * @this Core.Services.ServicesLocator
                 * @memberof Core.Services.ServicesLocator
                 * @throws 
                 * @param   {Function}    T
                 * @return  {T}
                 */
                Get: function (T) {
if ( TRACE ) { TRACE( "Core.Services.ServicesLocator#Get", this ); }

                    var type = T;
                    var service = { };
                    if (Core.Services.ServicesLocator._services.tryGetValue(type, service)) {
                        return Bridge.as(service.v, T);
                    }

                    throw new System.Exception(System.String.format("Service of {0} is not registered", [type]));
                },
                /*Core.Services.ServicesLocator.Get:static end.*/

                /*Core.Services.ServicesLocator.Unregister:static start.*/
                /**
                 * Removes a registered service
                 *
                 * @static
                 * @public
                 * @this Core.Services.ServicesLocator
                 * @memberof Core.Services.ServicesLocator
                 * @param   {Function}    T
                 * @return  {void}
                 */
                Unregister: function (T) {
if ( TRACE ) { TRACE( "Core.Services.ServicesLocator#Unregister", this ); }

                    var type = T;
                    Core.Services.ServicesLocator._services.remove(type);
                },
                /*Core.Services.ServicesLocator.Unregister:static end.*/

                /*Core.Services.ServicesLocator.ClearAll:static start.*/
                /**
                 * Clear all registered service(for cleanup or scene transitions).
                 *
                 * @static
                 * @public
                 * @this Core.Services.ServicesLocator
                 * @memberof Core.Services.ServicesLocator
                 * @return  {void}
                 */
                ClearAll: function () {
if ( TRACE ) { TRACE( "Core.Services.ServicesLocator#ClearAll", this ); }

                    Core.Services.ServicesLocator._services.clear();
                },
                /*Core.Services.ServicesLocator.ClearAll:static end.*/


            }
        }
    });
    /*Core.Services.ServicesLocator end.*/

    /*CTAManager start.*/
    Bridge.define("CTAManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            IsCTA: false,
            iosLink: null,
            androidLink: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "CTAManager#init", this ); }

                this.IsCTA = false;
            }
        },
        methods: {
            /*CTAManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "CTAManager#Awake", this ); }

                CTAManager.Instance = this;
            },
            /*CTAManager.Awake end.*/

            /*CTAManager.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "CTAManager#Start", this ); }

                Luna.Unity.LifeCycle.GameStarted();
                this.IsCTA = false;
            },
            /*CTAManager.Start end.*/

            /*CTAManager.Update start.*/
            Update: function () {
if ( TRACE ) { TRACE( "CTAManager#Update", this ); }

                if (UnityEngine.Input.GetMouseButtonDown(0) && this.IsCTA) {
                    this.CTAClick();
                }
            },
            /*CTAManager.Update end.*/

            /*CTAManager.CTAClick start.*/
            CTAClick: function () {
if ( TRACE ) { TRACE( "CTAManager#CTAClick", this ); }

                Luna.Unity.Playable.InstallFullGame(this.iosLink, this.androidLink);
                Luna.Unity.LifeCycle.GameEnded();
            },
            /*CTAManager.CTAClick end.*/

            /*CTAManager.EnableCTA start.*/
            EnableCTA: function () {
if ( TRACE ) { TRACE( "CTAManager#EnableCTA", this ); }

                this.IsCTA = true;
            },
            /*CTAManager.EnableCTA end.*/

            /*CTAManager.CTAClickAlt start.*/
            CTAClickAlt: function () {
if ( TRACE ) { TRACE( "CTAManager#CTAClickAlt", this ); }

                this.CTAClick();
            },
            /*CTAManager.CTAClickAlt end.*/


        }
    });
    /*CTAManager end.*/

    /*DG.Tweening.DOTweenCYInstruction start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction");
    /*DG.Tweening.DOTweenCYInstruction end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForCompletion start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForCompletion", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForCompletion#keepWaiting#get", this ); }

                    return this.t.active && !DG.Tweening.TweenExtensions.IsComplete(this.t);
                }
            }
        },
        ctors: {
            ctor: function (tween) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForCompletion#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForCompletion end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForElapsedLoops start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null,
            elapsedLoops: 0
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops#keepWaiting#get", this ); }

                    return this.t.active && DG.Tweening.TweenExtensions.CompletedLoops(this.t) < this.elapsedLoops;
                }
            }
        },
        ctors: {
            ctor: function (tween, elapsedLoops) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
                this.elapsedLoops = elapsedLoops;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForElapsedLoops end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForKill start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForKill", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForKill#keepWaiting#get", this ); }

                    return this.t.active;
                }
            }
        },
        ctors: {
            ctor: function (tween) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForKill#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForKill end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForPosition start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForPosition", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null,
            position: 0
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForPosition#keepWaiting#get", this ); }

                    return this.t.active && this.t.position * (((DG.Tweening.TweenExtensions.CompletedLoops(this.t) + 1) | 0)) < this.position;
                }
            }
        },
        ctors: {
            ctor: function (tween, position) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForPosition#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
                this.position = position;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForPosition end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForRewind start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForRewind", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForRewind#keepWaiting#get", this ); }

                    return this.t.active && (!this.t.playedOnce || this.t.position * (((DG.Tweening.TweenExtensions.CompletedLoops(this.t) + 1) | 0)) > 0);
                }
            }
        },
        ctors: {
            ctor: function (tween) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForRewind#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForRewind end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForStart start.*/
    Bridge.define("DG.Tweening.DOTweenCYInstruction.WaitForStart", {
        inherits: [UnityEngine.CustomYieldInstruction],
        $kind: 1002,
        fields: {
            t: null
        },
        props: {
            keepWaiting: {
                get: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForStart#keepWaiting#get", this ); }

                    return this.t.active && !this.t.playedOnce;
                }
            }
        },
        ctors: {
            ctor: function (tween) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenCYInstruction.WaitForStart#ctor", this ); }

                this.$initialize();
                UnityEngine.CustomYieldInstruction.ctor.call(this);
                this.t = tween;
            }
        }
    });
    /*DG.Tweening.DOTweenCYInstruction+WaitForStart end.*/

    /*DG.Tweening.DOTweenModuleAudio start.*/
    Bridge.define("DG.Tweening.DOTweenModuleAudio", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleAudio.DOFade:static start.*/
                /**
                 * Tweens an AudioSource's volume to the given value.
                 Also stores the AudioSource as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.AudioSource}           target      
                 * @param   {number}                            endValue    The end value to reach (0 to 1)
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOFade", this ); }

                    if (endValue < 0) {
                        endValue = 0;
                    } else {
                        if (endValue > 1) {
                            endValue = 1;
                        }
                    }
                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.volume;
                    }, function (x) {
                        target.volume = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleAudio.DOFade:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOPitch:static start.*/
                /**
                 * Tweens an AudioSource's pitch to the given value.
                 Also stores the AudioSource as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.AudioSource}           target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPitch: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOPitch", this ); }

                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.pitch;
                    }, function (x) {
                        target.pitch = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleAudio.DOPitch:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOSetFloat:static start.*/
                /**
                 * Tweens an AudioMixer's exposed float to the given value.
                 Also stores the AudioMixer as the tween's target so it can be used for filtered operations.
                 Note that you need to manually expose a float in an AudioMixerGroup in order to be able to tween it from an AudioMixer.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}      target       
                 * @param   {string}                            floatName    Name given to the exposed float to set
                 * @param   {number}                            endValue     The end value to reach
                 * @param   {number}                            duration     The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOSetFloat: function (target, floatName, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOSetFloat", this ); }

                    var t = DG.Tweening.DOTween.To$4(function () {
                        var currVal = { };
                        target.GetFloat(floatName, currVal);
                        return currVal.v;
                    }, function (x) {
                        target.SetFloat(floatName, x);
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleAudio.DOSetFloat:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOComplete:static start.*/
                /**
                 * Completes all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens completed
                 (meaning the tweens that don't have infinite loops and were not already complete)
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target           
                 * @param   {boolean}                         withCallbacks    For Sequences only: if TRUE also internal Sequence callbacks will be fired,
                 otherwise they will be ignored
                 * @return  {number}
                 */
                DOComplete: function (target, withCallbacks) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOComplete", this ); }

                    if (withCallbacks === void 0) { withCallbacks = false; }
                    return DG.Tweening.DOTween.Complete(target, withCallbacks);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOComplete:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOKill:static start.*/
                /**
                 * Kills all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens killed.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target      
                 * @param   {boolean}                         complete    If TRUE completes the tween before killing it
                 * @return  {number}
                 */
                DOKill: function (target, complete) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOKill", this ); }

                    if (complete === void 0) { complete = false; }
                    return DG.Tweening.DOTween.Kill(target, complete);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOKill:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOFlip:static start.*/
                /**
                 * Flips the direction (backwards if it was going forward or viceversa) of all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens flipped.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOFlip: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOFlip", this ); }

                    return DG.Tweening.DOTween.Flip(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOFlip:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOGoto:static start.*/
                /**
                 * Sends to the given position all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens involved.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target     
                 * @param   {number}                          to         Time position to reach
                 (if higher than the whole tween duration the tween will simply reach its end)
                 * @param   {boolean}                         andPlay    If TRUE will play the tween after reaching the given position, otherwise it will pause it
                 * @return  {number}
                 */
                DOGoto: function (target, to, andPlay) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOGoto", this ); }

                    if (andPlay === void 0) { andPlay = false; }
                    return DG.Tweening.DOTween.Goto(target, to, andPlay);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOGoto:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOPause:static start.*/
                /**
                 * Pauses all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens paused.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOPause: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOPause", this ); }

                    return DG.Tweening.DOTween.Pause(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOPause:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOPlay:static start.*/
                /**
                 * Plays all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens played.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOPlay: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOPlay", this ); }

                    return DG.Tweening.DOTween.Play(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOPlay:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOPlayBackwards:static start.*/
                /**
                 * Plays backwards all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens played.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOPlayBackwards: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOPlayBackwards", this ); }

                    return DG.Tweening.DOTween.PlayBackwards(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOPlayBackwards:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOPlayForward:static start.*/
                /**
                 * Plays forward all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens played.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOPlayForward: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOPlayForward", this ); }

                    return DG.Tweening.DOTween.PlayForward(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOPlayForward:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DORestart:static start.*/
                /**
                 * Restarts all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens restarted.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DORestart: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DORestart", this ); }

                    return DG.Tweening.DOTween.Restart(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DORestart:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DORewind:static start.*/
                /**
                 * Rewinds all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens rewinded.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DORewind: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DORewind", this ); }

                    return DG.Tweening.DOTween.Rewind(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DORewind:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOSmoothRewind:static start.*/
                /**
                 * Smoothly rewinds all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens rewinded.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOSmoothRewind: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOSmoothRewind", this ); }

                    return DG.Tweening.DOTween.SmoothRewind(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOSmoothRewind:static end.*/

                /*DG.Tweening.DOTweenModuleAudio.DOTogglePause:static start.*/
                /**
                 * Toggles the paused state (plays if it was paused, pauses if it was playing) of all tweens that have this target as a reference
                 (meaning tweens that were started from this target, or that had this target added as an Id)
                 and returns the total number of tweens involved.
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleAudio
                 * @memberof DG.Tweening.DOTweenModuleAudio
                 * @param   {UnityEngine.Audio.AudioMixer}    target
                 * @return  {number}
                 */
                DOTogglePause: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleAudio#DOTogglePause", this ); }

                    return DG.Tweening.DOTween.TogglePause(target);
                },
                /*DG.Tweening.DOTweenModuleAudio.DOTogglePause:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleAudio end.*/

    /*DG.Tweening.DOTweenModulePhysics start.*/
    Bridge.define("DG.Tweening.DOTweenModulePhysics", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModulePhysics.DOMove:static start.*/
                /**
                 * Tweens a Rigidbody's position to the given value.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target      
                 * @param   {UnityEngine.Vector3}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMove: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOMove", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$13(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOMove:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOMoveX:static start.*/
                /**
                 * Tweens a Rigidbody's X position to the given value.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMoveX: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOMoveX", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( endValue, 0, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.X, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOMoveX:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOMoveY:static start.*/
                /**
                 * Tweens a Rigidbody's Y position to the given value.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMoveY: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOMoveY", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( 0, endValue, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.Y, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOMoveY:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOMoveZ:static start.*/
                /**
                 * Tweens a Rigidbody's Z position to the given value.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMoveZ: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOMoveZ", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( 0, 0, endValue ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.Z, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOMoveZ:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DORotate:static start.*/
                /**
                 * Tweens a Rigidbody's rotation to the given value.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target      
                 * @param   {UnityEngine.Vector3}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {DG.Tweening.RotateMode}            mode        Rotation mode
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DORotate: function (target, endValue, duration, mode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DORotate", this ); }

                    if (mode === void 0) { mode = 0; }
                    var t = DG.Tweening.DOTween.To$9(function () {
                        return target.rotation;
                    }, Bridge.fn.cacheBind(target, target.MoveRotation), endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Quaternion,UnityEngine.Vector3,DG.Tweening.Plugins.Options.QuaternionOptions), t, target);
                    t.plugOptions.rotateMode = mode;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DORotate:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOLookAt:static start.*/
                /**
                 * Tweens a Rigidbody's rotation so that it will look towards the given position.
                 Also stores the rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target            
                 * @param   {UnityEngine.Vector3}               towards           The position to look at
                 * @param   {number}                            duration          The duration of the tween
                 * @param   {DG.Tweening.AxisConstraint}        axisConstraint    Eventual axis constraint for the rotation
                 * @param   {?UnityEngine.Vector3}              up                The vector that defines in which direction up is (default: Vector3.up)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOLookAt: function (target, towards, duration, axisConstraint, up) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOLookAt", this ); }

                    if (axisConstraint === void 0) { axisConstraint = 0; }
                    if (up === void 0) { up = null; }
                    var t = DG.Tweening.Core.Extensions.SetSpecialStartupMode(DG.Tweening.Core.TweenerCore$3(UnityEngine.Quaternion,UnityEngine.Vector3,DG.Tweening.Plugins.Options.QuaternionOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Quaternion,UnityEngine.Vector3,DG.Tweening.Plugins.Options.QuaternionOptions), DG.Tweening.DOTween.To$9(function () {
                        return target.rotation;
                    }, Bridge.fn.cacheBind(target, target.MoveRotation), towards.$clone(), duration), target), DG.Tweening.Core.Enums.SpecialStartupMode.SetLookAt);
                    t.plugOptions.axisConstraint = axisConstraint;
                    t.plugOptions.up = (pc.Vec3.equals( up, null )) ? pc.Vec3.UP.clone() : System.Nullable.getValue(up);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOLookAt:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOJump:static start.*/
                /**
                 * Tweens a Rigidbody's position to the given value, while also applying a jump effect along the Y axis.
                 Returns a Sequence instead of a Tweener.
                 Also stores the Rigidbody as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}    target       
                 * @param   {UnityEngine.Vector3}      endValue     The end value to reach
                 * @param   {number}                   jumpPower    Power of the jump (the max height of the jump is represented by this plus the final Y offset)
                 * @param   {number}                   numJumps     Total number of jumps
                 * @param   {number}                   duration     The duration of the tween
                 * @param   {boolean}                  snapping     If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Sequence}
                 */
                DOJump: function (target, endValue, jumpPower, numJumps, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOJump", this ); }

                    if (snapping === void 0) { snapping = false; }
                    if (numJumps < 1) {
                        numJumps = 1;
                    }
                    var startPosY = 0;
                    var offsetY = -1;
                    var offsetYSet = false;
                    var s = DG.Tweening.DOTween.Sequence();
                    var yTween = DG.Tweening.TweenSettingsExtensions.OnStart(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetLoops$1(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetRelative(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( 0, jumpPower, 0 ), duration / (Bridge.Int.mul(numJumps, 2))), DG.Tweening.AxisConstraint.Y, snapping), DG.Tweening.Ease.OutQuad)), Bridge.Int.mul(numJumps, 2), DG.Tweening.LoopType.Yoyo), function () {
                        startPosY = target.position.y;
                    });
                    DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( endValue.x, 0, 0 ), duration), DG.Tweening.AxisConstraint.X, snapping), DG.Tweening.Ease.Linear)), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(DG.Tweening.DOTween.To$12(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec3( 0, 0, endValue.z ), duration), DG.Tweening.AxisConstraint.Z, snapping), DG.Tweening.Ease.Linear)), yTween), target), DG.Tweening.DOTween.defaultEaseType);
                    DG.Tweening.TweenSettingsExtensions.OnUpdate(DG.Tweening.Tween, yTween, function () {
                        if (!offsetYSet) {
                            offsetYSet = true;
                            offsetY = s.isRelative ? endValue.y : endValue.y - startPosY;
                        }
                        var pos = target.position.$clone();
                        pos.y += DG.Tweening.DOVirtual.EasedValue(0, offsetY, DG.Tweening.TweenExtensions.ElapsedPercentage(yTween), DG.Tweening.Ease.OutQuad);
                        target.MovePosition(pos);
                    });
                    return s;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOJump:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOPath:static start.*/
                /**
                 * Tweens a Rigidbody's position through the given path waypoints, using the chosen path algorithm.
                 Also stores the Rigidbody as the tween's target so it can be used for filtered operations.
                 <p>NOTE: to tween a rigidbody correctly it should be set to kinematic at least while being tweened.</p><p>BEWARE: doesn't work on Windows Phone store (waiting for Unity to fix their own bug).
                 If you plan to publish there you should use a regular transform.DOPath.</p>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target        
                 * @param   {Array.<UnityEngine.Vector3>}       path          The waypoints to go through
                 * @param   {number}                            duration      The duration of the tween
                 * @param   {DG.Tweening.PathType}              pathType      The type of path: Linear (straight path), CatmullRom (curved CatmullRom path) or CubicBezier (curved with control points)
                 * @param   {DG.Tweening.PathMode}              pathMode      The path mode: 3D, side-scroller 2D, top-down 2D
                 * @param   {number}                            resolution    The resolution of the path (useless in case of Linear paths): higher resolutions make for more detailed curved paths but are more expensive.
                 Defaults to 10, but a value of 5 is usually enough if you don't have dramatic long curves between waypoints
                 * @param   {?UnityEngine.Color}                gizmoColor    The color of the path (shown when gizmos are active in the Play panel and the tween is running)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPath: function (target, path, duration, pathType, pathMode, resolution, gizmoColor) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOPath", this ); }

                    if (pathType === void 0) { pathType = 0; }
                    if (pathMode === void 0) { pathMode = 1; }
                    if (resolution === void 0) { resolution = 10; }
                    if (gizmoColor === void 0) { gizmoColor = null; }
                    if (resolution < 1) {
                        resolution = 1;
                    }
                    var t = DG.Tweening.TweenSettingsExtensions.SetUpdate$1(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new DG.Tweening.Plugins.Core.PathCore.Path.$ctor1(pathType, path, resolution, System.Nullable.lift1("$clone", gizmoColor)), duration), target), DG.Tweening.UpdateType.Fixed);

                    t.plugOptions.isRigidbody = true;
                    t.plugOptions.mode = pathMode;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOPath:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOPath$1:static start.*/
                DOPath$1: function (target, path, duration, pathMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOPath$1", this ); }

                    if (pathMode === void 0) { pathMode = 1; }
                    var t = DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), path, duration), target);

                    t.plugOptions.isRigidbody = true;
                    t.plugOptions.mode = pathMode;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOPath$1:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOLocalPath:static start.*/
                /**
                 * Tweens a Rigidbody's localPosition through the given path waypoints, using the chosen path algorithm.
                 Also stores the Rigidbody as the tween's target so it can be used for filtered operations
                 <p>NOTE: to tween a rigidbody correctly it should be set to kinematic at least while being tweened.</p><p>BEWARE: doesn't work on Windows Phone store (waiting for Unity to fix their own bug).
                 If you plan to publish there you should use a regular transform.DOLocalPath.</p>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics
                 * @memberof DG.Tweening.DOTweenModulePhysics
                 * @param   {UnityEngine.Rigidbody}             target        
                 * @param   {Array.<UnityEngine.Vector3>}       path          The waypoint to go through
                 * @param   {number}                            duration      The duration of the tween
                 * @param   {DG.Tweening.PathType}              pathType      The type of path: Linear (straight path), CatmullRom (curved CatmullRom path) or CubicBezier (curved with control points)
                 * @param   {DG.Tweening.PathMode}              pathMode      The path mode: 3D, side-scroller 2D, top-down 2D
                 * @param   {number}                            resolution    The resolution of the path: higher resolutions make for more detailed curved paths but are more expensive.
                 Defaults to 10, but a value of 5 is usually enough if you don't have dramatic long curves between waypoints
                 * @param   {?UnityEngine.Color}                gizmoColor    The color of the path (shown when gizmos are active in the Play panel and the tween is running)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOLocalPath: function (target, path, duration, pathType, pathMode, resolution, gizmoColor) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOLocalPath", this ); }

                    if (pathType === void 0) { pathType = 0; }
                    if (pathMode === void 0) { pathMode = 1; }
                    if (resolution === void 0) { resolution = 10; }
                    if (gizmoColor === void 0) { gizmoColor = null; }
                    if (resolution < 1) {
                        resolution = 1;
                    }
                    var trans = target.transform;
                    var t = DG.Tweening.TweenSettingsExtensions.SetUpdate$1(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return trans.localPosition;
                    }, function (x) {
                        target.MovePosition(UnityEngine.Component.op_Equality(trans.parent, null) ? x.$clone() : trans.parent.TransformPoint$1(x));
                    }, new DG.Tweening.Plugins.Core.PathCore.Path.$ctor1(pathType, path, resolution, System.Nullable.lift1("$clone", gizmoColor)), duration), target), DG.Tweening.UpdateType.Fixed);

                    t.plugOptions.isRigidbody = true;
                    t.plugOptions.mode = pathMode;
                    t.plugOptions.useLocalPosition = true;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOLocalPath:static end.*/

                /*DG.Tweening.DOTweenModulePhysics.DOLocalPath$1:static start.*/
                DOLocalPath$1: function (target, path, duration, pathMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics#DOLocalPath$1", this ); }

                    if (pathMode === void 0) { pathMode = 1; }
                    var trans = target.transform;
                    var t = DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return trans.localPosition;
                    }, function (x) {
                        target.MovePosition(UnityEngine.Component.op_Equality(trans.parent, null) ? x.$clone() : trans.parent.TransformPoint$1(x));
                    }, path, duration), target);

                    t.plugOptions.isRigidbody = true;
                    t.plugOptions.mode = pathMode;
                    t.plugOptions.useLocalPosition = true;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics.DOLocalPath$1:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModulePhysics end.*/

    /*DG.Tweening.DOTweenModulePhysics2D start.*/
    Bridge.define("DG.Tweening.DOTweenModulePhysics2D", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModulePhysics2D.DOMove:static start.*/
                /**
                 * Tweens a Rigidbody2D's position to the given value.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMove: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOMove", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOMove:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOMoveX:static start.*/
                /**
                 * Tweens a Rigidbody2D's X position to the given value.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMoveX: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOMoveX", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec2( endValue, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.X, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOMoveX:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOMoveY:static start.*/
                /**
                 * Tweens a Rigidbody2D's Y position to the given value.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMoveY: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOMoveY", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.position;
                    }, Bridge.fn.cacheBind(target, target.MovePosition), new pc.Vec2( 0, endValue ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.Y, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOMoveY:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DORotate:static start.*/
                /**
                 * Tweens a Rigidbody2D's rotation to the given value.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DORotate: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DORotate", this ); }

                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.rotation;
                    }, Bridge.fn.cacheBind(target, target.MoveRotation), endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DORotate:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOJump:static start.*/
                /**
                 * Tweens a Rigidbody2D's position to the given value, while also applying a jump effect along the Y axis.
                 Returns a Sequence instead of a Tweener.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations.
                 <p>IMPORTANT: a rigidbody2D can't be animated in a jump arc using MovePosition, so the tween will directly set the position</p>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}    target       
                 * @param   {UnityEngine.Vector2}        endValue     The end value to reach
                 * @param   {number}                     jumpPower    Power of the jump (the max height of the jump is represented by this plus the final Y offset)
                 * @param   {number}                     numJumps     Total number of jumps
                 * @param   {number}                     duration     The duration of the tween
                 * @param   {boolean}                    snapping     If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Sequence}
                 */
                DOJump: function (target, endValue, jumpPower, numJumps, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOJump", this ); }

                    if (snapping === void 0) { snapping = false; }
                    if (numJumps < 1) {
                        numJumps = 1;
                    }
                    var startPosY = 0;
                    var offsetY = -1;
                    var offsetYSet = false;
                    var s = DG.Tweening.DOTween.Sequence();
                    var yTween = DG.Tweening.TweenSettingsExtensions.OnStart(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetLoops$1(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetRelative(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(DG.Tweening.DOTween.To$11(function () {
                        return target.position;
                    }, function (x) {
                        target.position = x.$clone();
                    }, new pc.Vec2( 0, jumpPower ), duration / (Bridge.Int.mul(numJumps, 2))), DG.Tweening.AxisConstraint.Y, snapping), DG.Tweening.Ease.OutQuad)), Bridge.Int.mul(numJumps, 2), DG.Tweening.LoopType.Yoyo), function () {
                        startPosY = target.position.y;
                    });
                    DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(DG.Tweening.DOTween.To$11(function () {
                        return target.position;
                    }, function (x) {
                        target.position = x.$clone();
                    }, new pc.Vec2( endValue.x, 0 ), duration), DG.Tweening.AxisConstraint.X, snapping), DG.Tweening.Ease.Linear)), yTween), target), DG.Tweening.DOTween.defaultEaseType);
                    DG.Tweening.TweenSettingsExtensions.OnUpdate(DG.Tweening.Tween, yTween, function () {
                        if (!offsetYSet) {
                            offsetYSet = true;
                            offsetY = s.isRelative ? endValue.y : endValue.y - startPosY;
                        }
                        var pos = UnityEngine.Vector3.FromVector2(target.position.$clone());
                        pos.y += DG.Tweening.DOVirtual.EasedValue(0, offsetY, DG.Tweening.TweenExtensions.ElapsedPercentage(yTween), DG.Tweening.Ease.OutQuad);
                        target.MovePosition$1(pos);
                    });
                    return s;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOJump:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOPath:static start.*/
                /**
                 * Tweens a Rigidbody2D's position through the given path waypoints, using the chosen path algorithm.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations.
                 <p>NOTE: to tween a Rigidbody2D correctly it should be set to kinematic at least while being tweened.</p><p>BEWARE: doesn't work on Windows Phone store (waiting for Unity to fix their own bug).
                 If you plan to publish there you should use a regular transform.DOPath.</p>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target        
                 * @param   {Array.<UnityEngine.Vector2>}       path          The waypoints to go through
                 * @param   {number}                            duration      The duration of the tween
                 * @param   {DG.Tweening.PathType}              pathType      The type of path: Linear (straight path), CatmullRom (curved CatmullRom path) or CubicBezier (curved with control points)
                 * @param   {DG.Tweening.PathMode}              pathMode      The path mode: 3D, side-scroller 2D, top-down 2D
                 * @param   {number}                            resolution    The resolution of the path (useless in case of Linear paths): higher resolutions make for more detailed curved paths but are more expensive.
                 Defaults to 10, but a value of 5 is usually enough if you don't have dramatic long curves between waypoints
                 * @param   {?UnityEngine.Color}                gizmoColor    The color of the path (shown when gizmos are active in the Play panel and the tween is running)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPath: function (target, path, duration, pathType, pathMode, resolution, gizmoColor) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOPath", this ); }

                    if (pathType === void 0) { pathType = 0; }
                    if (pathMode === void 0) { pathMode = 1; }
                    if (resolution === void 0) { resolution = 10; }
                    if (gizmoColor === void 0) { gizmoColor = null; }
                    if (resolution < 1) {
                        resolution = 1;
                    }
                    var len = path.length;
                    var path3D = System.Array.init(len, function (){
                        return new UnityEngine.Vector3();
                    }, UnityEngine.Vector3);
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        path3D[i] = UnityEngine.Vector3.FromVector2(path[i].$clone());
                    }
                    var t = DG.Tweening.TweenSettingsExtensions.SetUpdate$1(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return UnityEngine.Vector3.FromVector2(target.position);
                    }, function (x) {
                        target.MovePosition$1(x);
                    }, new DG.Tweening.Plugins.Core.PathCore.Path.$ctor1(pathType, path3D, resolution, System.Nullable.lift1("$clone", gizmoColor)), duration), target), DG.Tweening.UpdateType.Fixed);

                    t.plugOptions.isRigidbody2D = true;
                    t.plugOptions.mode = pathMode;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOPath:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOPath$1:static start.*/
                DOPath$1: function (target, path, duration, pathMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOPath$1", this ); }

                    if (pathMode === void 0) { pathMode = 1; }
                    var t = DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return UnityEngine.Vector3.FromVector2(target.position);
                    }, function (x) {
                        target.MovePosition$1(x);
                    }, path, duration), target);

                    t.plugOptions.isRigidbody2D = true;
                    t.plugOptions.mode = pathMode;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOPath$1:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOLocalPath:static start.*/
                /**
                 * Tweens a Rigidbody2D's localPosition through the given path waypoints, using the chosen path algorithm.
                 Also stores the Rigidbody2D as the tween's target so it can be used for filtered operations
                 <p>NOTE: to tween a Rigidbody2D correctly it should be set to kinematic at least while being tweened.</p><p>BEWARE: doesn't work on Windows Phone store (waiting for Unity to fix their own bug).
                 If you plan to publish there you should use a regular transform.DOLocalPath.</p>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModulePhysics2D
                 * @memberof DG.Tweening.DOTweenModulePhysics2D
                 * @param   {UnityEngine.Rigidbody2D}           target        
                 * @param   {Array.<UnityEngine.Vector2>}       path          The waypoint to go through
                 * @param   {number}                            duration      The duration of the tween
                 * @param   {DG.Tweening.PathType}              pathType      The type of path: Linear (straight path), CatmullRom (curved CatmullRom path) or CubicBezier (curved with control points)
                 * @param   {DG.Tweening.PathMode}              pathMode      The path mode: 3D, side-scroller 2D, top-down 2D
                 * @param   {number}                            resolution    The resolution of the path: higher resolutions make for more detailed curved paths but are more expensive.
                 Defaults to 10, but a value of 5 is usually enough if you don't have dramatic long curves between waypoints
                 * @param   {?UnityEngine.Color}                gizmoColor    The color of the path (shown when gizmos are active in the Play panel and the tween is running)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOLocalPath: function (target, path, duration, pathType, pathMode, resolution, gizmoColor) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOLocalPath", this ); }

                    if (pathType === void 0) { pathType = 0; }
                    if (pathMode === void 0) { pathMode = 1; }
                    if (resolution === void 0) { resolution = 10; }
                    if (gizmoColor === void 0) { gizmoColor = null; }
                    if (resolution < 1) {
                        resolution = 1;
                    }
                    var len = path.length;
                    var path3D = System.Array.init(len, function (){
                        return new UnityEngine.Vector3();
                    }, UnityEngine.Vector3);
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        path3D[i] = UnityEngine.Vector3.FromVector2(path[i].$clone());
                    }
                    var trans = target.transform;
                    var t = DG.Tweening.TweenSettingsExtensions.SetUpdate$1(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return trans.localPosition;
                    }, function (x) {
                        target.MovePosition$1(UnityEngine.Component.op_Equality(trans.parent, null) ? x.$clone() : trans.parent.TransformPoint$1(x));
                    }, new DG.Tweening.Plugins.Core.PathCore.Path.$ctor1(pathType, path3D, resolution, System.Nullable.lift1("$clone", gizmoColor)), duration), target), DG.Tweening.UpdateType.Fixed);

                    t.plugOptions.isRigidbody2D = true;
                    t.plugOptions.mode = pathMode;
                    t.plugOptions.useLocalPosition = true;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOLocalPath:static end.*/

                /*DG.Tweening.DOTweenModulePhysics2D.DOLocalPath$1:static start.*/
                DOLocalPath$1: function (target, path, duration, pathMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModulePhysics2D#DOLocalPath$1", this ); }

                    if (pathMode === void 0) { pathMode = 1; }
                    var trans = target.transform;
                    var t = DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions), DG.Tweening.DOTween.To(UnityEngine.Vector3, DG.Tweening.Plugins.Core.PathCore.Path, DG.Tweening.Plugins.Options.PathOptions, DG.Tweening.Plugins.PathPlugin.Get(), function () {
                        return trans.localPosition;
                    }, function (x) {
                        target.MovePosition$1(UnityEngine.Component.op_Equality(trans.parent, null) ? x.$clone() : trans.parent.TransformPoint$1(x));
                    }, path, duration), target);

                    t.plugOptions.isRigidbody2D = true;
                    t.plugOptions.mode = pathMode;
                    t.plugOptions.useLocalPosition = true;
                    return t;
                },
                /*DG.Tweening.DOTweenModulePhysics2D.DOLocalPath$1:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModulePhysics2D end.*/

    /*DG.Tweening.DOTweenModuleSprite start.*/
    Bridge.define("DG.Tweening.DOTweenModuleSprite", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleSprite.DOColor:static start.*/
                /**
                 * Tweens a SpriteRenderer's color to the given value.
                 Also stores the spriteRenderer as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleSprite
                 * @memberof DG.Tweening.DOTweenModuleSprite
                 * @param   {UnityEngine.SpriteRenderer}        target      
                 * @param   {UnityEngine.Color}                 endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOColor: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleSprite#DOColor", this ); }

                    var t = DG.Tweening.DOTween.To$8(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleSprite.DOColor:static end.*/

                /*DG.Tweening.DOTweenModuleSprite.DOFade:static start.*/
                /**
                 * Tweens a Material's alpha color to the given value.
                 Also stores the spriteRenderer as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleSprite
                 * @memberof DG.Tweening.DOTweenModuleSprite
                 * @param   {UnityEngine.SpriteRenderer}        target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleSprite#DOFade", this ); }

                    var t = DG.Tweening.DOTween.ToAlpha(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleSprite.DOFade:static end.*/

                /*DG.Tweening.DOTweenModuleSprite.DOGradientColor:static start.*/
                /**
                 * Tweens a SpriteRenderer's color using the given gradient
                 (NOTE 1: only uses the colors of the gradient, not the alphas - NOTE 2: creates a Sequence, not a Tweener).
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleSprite
                 * @memberof DG.Tweening.DOTweenModuleSprite
                 * @param   {UnityEngine.SpriteRenderer}    target      
                 * @param   {pc.ColorGradient}              gradient    The gradient to use
                 * @param   {number}                        duration    The duration of the tween
                 * @return  {DG.Tweening.Sequence}
                 */
                DOGradientColor: function (target, gradient, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleSprite#DOGradientColor", this ); }

                    var s = DG.Tweening.DOTween.Sequence();
                    var colors = gradient.colorKeys;
                    var len = colors.length;
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        var c = colors[i];
                        if (i === 0 && c.time <= 0) {
                            target.color = c.color.$clone();
                            continue;
                        }
                        var colorDuration = i === ((len - 1) | 0) ? duration - DG.Tweening.TweenExtensions.Duration(s, false) : duration * (i === 0 ? c.time : c.time - colors[((i - 1) | 0)].time);
                        DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.DOTweenModuleSprite.DOColor(target, c.color.$clone(), colorDuration), DG.Tweening.Ease.Linear));
                    }
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, s, target);
                    return s;
                },
                /*DG.Tweening.DOTweenModuleSprite.DOGradientColor:static end.*/

                /*DG.Tweening.DOTweenModuleSprite.DOBlendableColor:static start.*/
                /**
                 * Tweens a SpriteRenderer's color to the given value,
                 in a way that allows other DOBlendableColor tweens to work together on the same target,
                 instead than fight each other as multiple DOColor would do.
                 Also stores the SpriteRenderer as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleSprite
                 * @memberof DG.Tweening.DOTweenModuleSprite
                 * @param   {UnityEngine.SpriteRenderer}    target      
                 * @param   {UnityEngine.Color}             endValue    The value to tween to
                 * @param   {number}                        duration    The duration of the tween
                 * @return  {DG.Tweening.Tweener}
                 */
                DOBlendableColor: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleSprite#DOBlendableColor", this ); }

                    var $t;
                    endValue = ($t = target.color, new pc.Color( endValue.r - $t.r, endValue.g - $t.g, endValue.b - $t.b, endValue.a - $t.a ));
                    var to = new pc.Color( 0, 0, 0, 0 );
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.Core.Extensions.Blendable(UnityEngine.Color, UnityEngine.Color, DG.Tweening.Plugins.Options.ColorOptions, DG.Tweening.DOTween.To$8(function () {
                        return to;
                    }, function (x) {
                        var $t1;
                        var diff = new pc.Color( x.r - to.r, x.g - to.g, x.b - to.b, x.a - to.a );
                        to = x.$clone();
                        target.color = ($t1 = target.color.$clone(), new pc.Color( $t1.r + diff.$clone().r, $t1.g + diff.$clone().g, $t1.b + diff.$clone().b, $t1.a + diff.$clone().a ));
                    }, endValue.$clone(), duration)), target);
                },
                /*DG.Tweening.DOTweenModuleSprite.DOBlendableColor:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleSprite end.*/

    /*DG.Tweening.DOTweenModuleUI start.*/
    Bridge.define("DG.Tweening.DOTweenModuleUI", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleUI.DOFade:static start.*/
                /**
                 * Tweens a CanvasGroup's alpha color to the given value.
                 Also stores the canvasGroup as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.CanvasGroup}           target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFade", this ); }

                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.alpha;
                    }, function (x) {
                        target.alpha = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFade:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFade$1:static start.*/
                /**
                 * Tweens an Graphic's alpha color to the given value.
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Graphic}            target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade$1: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFade$1", this ); }

                    var t = DG.Tweening.DOTween.ToAlpha(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFade$1:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFade$2:static start.*/
                /**
                 * Tweens an Image's alpha color to the given value.
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Image}              target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade$2: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFade$2", this ); }

                    var t = DG.Tweening.DOTween.ToAlpha(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFade$2:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFade$3:static start.*/
                /**
                 * Tweens a Outline's effectColor alpha to the given value.
                 Also stores the Outline as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Outline}            target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade$3: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFade$3", this ); }

                    var t = DG.Tweening.DOTween.ToAlpha(function () {
                        return target.effectColor;
                    }, function (x) {
                        target.effectColor = x.$clone();
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFade$3:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFade$4:static start.*/
                /**
                 * Tweens a Text's alpha color to the given value.
                 Also stores the Text as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Text}               target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFade$4: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFade$4", this ); }

                    var t = DG.Tweening.DOTween.ToAlpha(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFade$4:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOColor:static start.*/
                /**
                 * Tweens an Graphic's color to the given value.
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Graphic}            target      
                 * @param   {UnityEngine.Color}                 endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOColor: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOColor", this ); }

                    var t = DG.Tweening.DOTween.To$8(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOColor:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOColor$1:static start.*/
                /**
                 * Tweens an Image's color to the given value.
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Image}              target      
                 * @param   {UnityEngine.Color}                 endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOColor$1: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOColor$1", this ); }

                    var t = DG.Tweening.DOTween.To$8(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOColor$1:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOColor$2:static start.*/
                /**
                 * Tweens a Outline's effectColor to the given value.
                 Also stores the Outline as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Outline}            target      
                 * @param   {UnityEngine.Color}                 endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOColor$2: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOColor$2", this ); }

                    var t = DG.Tweening.DOTween.To$8(function () {
                        return target.effectColor;
                    }, function (x) {
                        target.effectColor = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOColor$2:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOColor$3:static start.*/
                /**
                 * Tweens a Text's color to the given value.
                 Also stores the Text as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Text}               target      
                 * @param   {UnityEngine.Color}                 endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOColor$3: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOColor$3", this ); }

                    var t = DG.Tweening.DOTween.To$8(function () {
                        return target.color;
                    }, function (x) {
                        target.color = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOColor$3:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFillAmount:static start.*/
                /**
                 * Tweens an Image's fillAmount to the given value.
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Image}              target      
                 * @param   {number}                            endValue    The end value to reach (0 to 1)
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFillAmount: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFillAmount", this ); }

                    if (endValue > 1) {
                        endValue = 1;
                    } else {
                        if (endValue < 0) {
                            endValue = 0;
                        }
                    }
                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.fillAmount;
                    }, function (x) {
                        target.fillAmount = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFillAmount:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOGradientColor:static start.*/
                /**
                 * Tweens an Image's colors using the given gradient
                 (NOTE 1: only uses the colors of the gradient, not the alphas - NOTE 2: creates a Sequence, not a Tweener).
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Image}    target      
                 * @param   {pc.ColorGradient}        gradient    The gradient to use
                 * @param   {number}                  duration    The duration of the tween
                 * @return  {DG.Tweening.Sequence}
                 */
                DOGradientColor: function (target, gradient, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOGradientColor", this ); }

                    var s = DG.Tweening.DOTween.Sequence();
                    var colors = gradient.colorKeys;
                    var len = colors.length;
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        var c = colors[i];
                        if (i === 0 && c.time <= 0) {
                            target.color = c.color.$clone();
                            continue;
                        }
                        var colorDuration = i === ((len - 1) | 0) ? duration - DG.Tweening.TweenExtensions.Duration(s, false) : duration * (i === 0 ? c.time : c.time - colors[((i - 1) | 0)].time);
                        DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.DOTweenModuleUI.DOColor$1(target, c.color.$clone(), colorDuration), DG.Tweening.Ease.Linear));
                    }
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, s, target);
                    return s;
                },
                /*DG.Tweening.DOTweenModuleUI.DOGradientColor:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOFlexibleSize:static start.*/
                /**
                 * Tweens an LayoutElement's flexibleWidth/Height to the given value.
                 Also stores the LayoutElement as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.LayoutElement}      target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOFlexibleSize: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOFlexibleSize", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return new pc.Vec2( target.flexibleWidth, target.flexibleHeight );
                    }, function (x) {
                        target.flexibleWidth = x.x;
                        target.flexibleHeight = x.y;
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOFlexibleSize:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOMinSize:static start.*/
                /**
                 * Tweens an LayoutElement's minWidth/Height to the given value.
                 Also stores the LayoutElement as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.LayoutElement}      target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOMinSize: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOMinSize", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return new pc.Vec2( target.minWidth, target.minHeight );
                    }, function (x) {
                        target.minWidth = x.x;
                        target.minHeight = x.y;
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOMinSize:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOPreferredSize:static start.*/
                /**
                 * Tweens an LayoutElement's preferredWidth/Height to the given value.
                 Also stores the LayoutElement as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.LayoutElement}      target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPreferredSize: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOPreferredSize", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return new pc.Vec2( target.preferredWidth, target.preferredHeight );
                    }, function (x) {
                        target.preferredWidth = x.x;
                        target.preferredHeight = x.y;
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOPreferredSize:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOScale:static start.*/
                /**
                 * Tweens a Outline's effectDistance to the given value.
                 Also stores the Outline as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Outline}            target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOScale: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOScale", this ); }

                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.effectDistance;
                    }, function (x) {
                        target.effectDistance = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOScale:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPos: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPos", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPosX:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition X to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPosX: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPosX", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, new pc.Vec2( endValue, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.X, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPosX:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPosY:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition Y to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPosY: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPosY", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, new pc.Vec2( 0, endValue ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.Y, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPosY:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3D:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition3D to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector3}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPos3D: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPos3D", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.anchoredPosition3D;
                    }, function (x) {
                        target.anchoredPosition3D = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$13(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3D:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DX:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition3D X to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPos3DX: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPos3DX", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.anchoredPosition3D;
                    }, function (x) {
                        target.anchoredPosition3D = x.$clone();
                    }, new pc.Vec3( endValue, 0, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.X, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DX:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DY:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition3D Y to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPos3DY: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPos3DY", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.anchoredPosition3D;
                    }, function (x) {
                        target.anchoredPosition3D = x.$clone();
                    }, new pc.Vec3( 0, endValue, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.Y, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DY:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DZ:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition3D Z to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorPos3DZ: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorPos3DZ", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$12(function () {
                        return target.anchoredPosition3D;
                    }, function (x) {
                        target.anchoredPosition3D = x.$clone();
                    }, new pc.Vec3( 0, 0, endValue ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$12(t, DG.Tweening.AxisConstraint.Z, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorPos3DZ:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorMax:static start.*/
                /**
                 * Tweens a RectTransform's anchorMax to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorMax: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorMax", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.anchorMax;
                    }, function (x) {
                        target.anchorMax = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorMax:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOAnchorMin:static start.*/
                /**
                 * Tweens a RectTransform's anchorMin to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOAnchorMin: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOAnchorMin", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.anchorMin;
                    }, function (x) {
                        target.anchorMin = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOAnchorMin:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOPivot:static start.*/
                /**
                 * Tweens a RectTransform's pivot to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPivot: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOPivot", this ); }

                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.pivot;
                    }, function (x) {
                        target.pivot = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOPivot:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOPivotX:static start.*/
                /**
                 * Tweens a RectTransform's pivot X to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPivotX: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOPivotX", this ); }

                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.pivot;
                    }, function (x) {
                        target.pivot = x.$clone();
                    }, new pc.Vec2( endValue, 0 ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.X), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOPivotX:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOPivotY:static start.*/
                /**
                 * Tweens a RectTransform's pivot Y to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOPivotY: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOPivotY", this ); }

                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.pivot;
                    }, function (x) {
                        target.pivot = x.$clone();
                    }, new pc.Vec2( 0, endValue ), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(t, DG.Tweening.AxisConstraint.Y), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOPivotY:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOSizeDelta:static start.*/
                /**
                 * Tweens a RectTransform's sizeDelta to the given value.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target      
                 * @param   {UnityEngine.Vector2}               endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOSizeDelta: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOSizeDelta", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.sizeDelta;
                    }, function (x) {
                        target.sizeDelta = x.$clone();
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOSizeDelta:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOPunchAnchorPos:static start.*/
                /**
                 * Punches a RectTransform's anchoredPosition towards the given direction and then back to the starting one
                 as if it was connected to the starting position via an elastic.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}    target        
                 * @param   {UnityEngine.Vector2}          punch         The direction and strength of the punch (added to the RectTransform's current position)
                 * @param   {number}                       duration      The duration of the tween
                 * @param   {number}                       vibrato       Indicates how much will the punch vibrate
                 * @param   {number}                       elasticity    Represents how much (0 to 1) the vector will go beyond the starting position when bouncing backwards.
                 1 creates a full oscillation between the punch direction and the opposite direction,
                 while 0 oscillates only between the punch and the start position
                 * @param   {boolean}                      snapping      If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Tweener}
                 */
                DOPunchAnchorPos: function (target, punch, duration, vibrato, elasticity, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOPunchAnchorPos", this ); }

                    if (vibrato === void 0) { vibrato = 10; }
                    if (elasticity === void 0) { elasticity = 1.0; }
                    if (snapping === void 0) { snapping = false; }
                    return DG.Tweening.TweenSettingsExtensions.SetOptions$11(DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,System.Array.type(UnityEngine.Vector3),DG.Tweening.Plugins.Options.Vector3ArrayOptions), DG.Tweening.DOTween.Punch(function () {
                        return UnityEngine.Vector3.FromVector2(target.anchoredPosition);
                    }, function (x) {
                        target.anchoredPosition = UnityEngine.Vector2.FromVector3(x.$clone());
                    }, UnityEngine.Vector3.FromVector2(punch.$clone()), duration, vibrato, elasticity), target), snapping);
                },
                /*DG.Tweening.DOTweenModuleUI.DOPunchAnchorPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOShakeAnchorPos:static start.*/
                /**
                 * Shakes a RectTransform's anchoredPosition with the given values.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}          target            
                 * @param   {number}                             duration          The duration of the tween
                 * @param   {number}                             strength          The shake strength
                 * @param   {number}                             vibrato           Indicates how much will the shake vibrate
                 * @param   {number}                             randomness        Indicates how much the shake will be random (0 to 180 - values higher than 90 kind of suck, so beware). 
                 Setting it to 0 will shake along a single direction.
                 * @param   {boolean}                            snapping          If TRUE the tween will smoothly snap all values to integers
                 * @param   {boolean}                            fadeOut           If TRUE the shake will automatically fadeOut smoothly within the tween's duration, otherwise it will not
                 * @param   {DG.Tweening.ShakeRandomnessMode}    randomnessMode    Randomness mode
                 * @return  {DG.Tweening.Tweener}
                 */
                DOShakeAnchorPos: function (target, duration, strength, vibrato, randomness, snapping, fadeOut, randomnessMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOShakeAnchorPos", this ); }

                    if (strength === void 0) { strength = 100.0; }
                    if (vibrato === void 0) { vibrato = 10; }
                    if (randomness === void 0) { randomness = 90.0; }
                    if (snapping === void 0) { snapping = false; }
                    if (fadeOut === void 0) { fadeOut = true; }
                    if (randomnessMode === void 0) { randomnessMode = 0; }
                    return DG.Tweening.TweenSettingsExtensions.SetOptions$11(DG.Tweening.Core.Extensions.SetSpecialStartupMode(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,System.Array.type(UnityEngine.Vector3),DG.Tweening.Plugins.Options.Vector3ArrayOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,System.Array.type(UnityEngine.Vector3),DG.Tweening.Plugins.Options.Vector3ArrayOptions), DG.Tweening.DOTween.Shake(function () {
                        return UnityEngine.Vector3.FromVector2(target.anchoredPosition);
                    }, function (x) {
                        target.anchoredPosition = UnityEngine.Vector2.FromVector3(x.$clone());
                    }, duration, strength, vibrato, randomness, true, fadeOut, randomnessMode), target), DG.Tweening.Core.Enums.SpecialStartupMode.SetShake), snapping);
                },
                /*DG.Tweening.DOTweenModuleUI.DOShakeAnchorPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOShakeAnchorPos$1:static start.*/
                /**
                 * Shakes a RectTransform's anchoredPosition with the given values.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}          target            
                 * @param   {number}                             duration          The duration of the tween
                 * @param   {UnityEngine.Vector2}                strength          The shake strength on each axis
                 * @param   {number}                             vibrato           Indicates how much will the shake vibrate
                 * @param   {number}                             randomness        Indicates how much the shake will be random (0 to 180 - values higher than 90 kind of suck, so beware). 
                 Setting it to 0 will shake along a single direction.
                 * @param   {boolean}                            snapping          If TRUE the tween will smoothly snap all values to integers
                 * @param   {boolean}                            fadeOut           If TRUE the shake will automatically fadeOut smoothly within the tween's duration, otherwise it will not
                 * @param   {DG.Tweening.ShakeRandomnessMode}    randomnessMode    Randomness mode
                 * @return  {DG.Tweening.Tweener}
                 */
                DOShakeAnchorPos$1: function (target, duration, strength, vibrato, randomness, snapping, fadeOut, randomnessMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOShakeAnchorPos$1", this ); }

                    if (vibrato === void 0) { vibrato = 10; }
                    if (randomness === void 0) { randomness = 90.0; }
                    if (snapping === void 0) { snapping = false; }
                    if (fadeOut === void 0) { fadeOut = true; }
                    if (randomnessMode === void 0) { randomnessMode = 0; }
                    return DG.Tweening.TweenSettingsExtensions.SetOptions$11(DG.Tweening.Core.Extensions.SetSpecialStartupMode(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,System.Array.type(UnityEngine.Vector3),DG.Tweening.Plugins.Options.Vector3ArrayOptions), DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,System.Array.type(UnityEngine.Vector3),DG.Tweening.Plugins.Options.Vector3ArrayOptions), DG.Tweening.DOTween.Shake$1(function () {
                        return UnityEngine.Vector3.FromVector2(target.anchoredPosition);
                    }, function (x) {
                        target.anchoredPosition = UnityEngine.Vector2.FromVector3(x.$clone());
                    }, duration, UnityEngine.Vector3.FromVector2(strength.$clone()), vibrato, randomness, fadeOut, randomnessMode), target), DG.Tweening.Core.Enums.SpecialStartupMode.SetShake), snapping);
                },
                /*DG.Tweening.DOTweenModuleUI.DOShakeAnchorPos$1:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOJumpAnchorPos:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition to the given value, while also applying a jump effect along the Y axis.
                 Returns a Sequence instead of a Tweener.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}    target       
                 * @param   {UnityEngine.Vector2}          endValue     The end value to reach
                 * @param   {number}                       jumpPower    Power of the jump (the max height of the jump is represented by this plus the final Y offset)
                 * @param   {number}                       numJumps     Total number of jumps
                 * @param   {number}                       duration     The duration of the tween
                 * @param   {boolean}                      snapping     If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Sequence}
                 */
                DOJumpAnchorPos: function (target, endValue, jumpPower, numJumps, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOJumpAnchorPos", this ); }

                    if (snapping === void 0) { snapping = false; }
                    if (numJumps < 1) {
                        numJumps = 1;
                    }
                    var startPosY = 0;
                    var offsetY = -1;
                    var offsetYSet = false;

                    // Separate Y Tween so we can elaborate elapsedPercentage on that insted of on the Sequence
                    // (in case users add a delay or other elements to the Sequence)
                    var s = DG.Tweening.DOTween.Sequence();
                    var yTween = DG.Tweening.TweenSettingsExtensions.OnStart(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetLoops$1(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetRelative(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(DG.Tweening.DOTween.To$11(function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, new pc.Vec2( 0, jumpPower ), duration / (Bridge.Int.mul(numJumps, 2))), DG.Tweening.AxisConstraint.Y, snapping), DG.Tweening.Ease.OutQuad)), Bridge.Int.mul(numJumps, 2), DG.Tweening.LoopType.Yoyo), function () {
                        startPosY = target.anchoredPosition.y;
                    });
                    DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, DG.Tweening.TweenSettingsExtensions.Join(DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$8(DG.Tweening.DOTween.To$11(function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, new pc.Vec2( endValue.x, 0 ), duration), DG.Tweening.AxisConstraint.X, snapping), DG.Tweening.Ease.Linear)), yTween), target), DG.Tweening.DOTween.defaultEaseType);
                    DG.Tweening.TweenSettingsExtensions.OnUpdate(DG.Tweening.Sequence, s, function () {
                        if (!offsetYSet) {
                            offsetYSet = true;
                            offsetY = s.isRelative ? endValue.y : endValue.y - startPosY;
                        }
                        var pos = target.anchoredPosition.$clone();
                        pos.y += DG.Tweening.DOVirtual.EasedValue(0, offsetY, DG.Tweening.TweenExtensions.ElapsedDirectionalPercentage(s), DG.Tweening.Ease.OutQuad);
                        target.anchoredPosition = pos.$clone();
                    });
                    return s;
                },
                /*DG.Tweening.DOTweenModuleUI.DOJumpAnchorPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DONormalizedPos:static start.*/
                /**
                 * Tweens a ScrollRect's horizontal/verticalNormalizedPosition to the given value.
                 Also stores the ScrollRect as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.ScrollRect}    target      
                 * @param   {UnityEngine.Vector2}          endValue    The end value to reach
                 * @param   {number}                       duration    The duration of the tween
                 * @param   {boolean}                      snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Tweener}
                 */
                DONormalizedPos: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DONormalizedPos", this ); }

                    if (snapping === void 0) { snapping = false; }
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$9(DG.Tweening.DOTween.To$11(function () {
                        return new pc.Vec2( target.horizontalNormalizedPosition, target.verticalNormalizedPosition );
                    }, function (x) {
                        target.horizontalNormalizedPosition = x.x;
                        target.verticalNormalizedPosition = x.y;
                    }, endValue.$clone(), duration), snapping), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DONormalizedPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOHorizontalNormalizedPos:static start.*/
                /**
                 * Tweens a ScrollRect's horizontalNormalizedPosition to the given value.
                 Also stores the ScrollRect as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.ScrollRect}    target      
                 * @param   {number}                       endValue    The end value to reach
                 * @param   {number}                       duration    The duration of the tween
                 * @param   {boolean}                      snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Tweener}
                 */
                DOHorizontalNormalizedPos: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOHorizontalNormalizedPos", this ); }

                    if (snapping === void 0) { snapping = false; }
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$2(DG.Tweening.DOTween.To$4(function () {
                        return target.horizontalNormalizedPosition;
                    }, function (x) {
                        target.horizontalNormalizedPosition = x;
                    }, endValue, duration), snapping), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DOHorizontalNormalizedPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOVerticalNormalizedPos:static start.*/
                /**
                 * Tweens a ScrollRect's verticalNormalizedPosition to the given value.
                 Also stores the ScrollRect as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.ScrollRect}    target      
                 * @param   {number}                       endValue    The end value to reach
                 * @param   {number}                       duration    The duration of the tween
                 * @param   {boolean}                      snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Tweener}
                 */
                DOVerticalNormalizedPos: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOVerticalNormalizedPos", this ); }

                    if (snapping === void 0) { snapping = false; }
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$2(DG.Tweening.DOTween.To$4(function () {
                        return target.verticalNormalizedPosition;
                    }, function (x) {
                        target.verticalNormalizedPosition = x;
                    }, endValue, duration), snapping), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DOVerticalNormalizedPos:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOValue:static start.*/
                /**
                 * Tweens a Slider's value to the given value.
                 Also stores the Slider as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Slider}             target      
                 * @param   {number}                            endValue    The end value to reach
                 * @param   {number}                            duration    The duration of the tween
                 * @param   {boolean}                           snapping    If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOValue: function (target, endValue, duration, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOValue", this ); }

                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To$4(function () {
                        return target.value;
                    }, function (x) {
                        target.value = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$2(t, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOValue:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOCounter:static start.*/
                /**
                 * Tweens a Text's text from one integer to another, with options for thousands separators
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Text}                 target                   
                 * @param   {number}                              fromValue                The value to start from
                 * @param   {number}                              endValue                 The end value to reach
                 * @param   {number}                              duration                 The duration of the tween
                 * @param   {boolean}                             addThousandsSeparator    If TRUE (default) also adds thousands separators
                 * @param   {System.Globalization.CultureInfo}    culture                  The {@link } to use (InvariantCulture if NULL)
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOCounter: function (target, fromValue, endValue, duration, addThousandsSeparator, culture) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOCounter", this ); }

                    if (addThousandsSeparator === void 0) { addThousandsSeparator = true; }
                    if (culture === void 0) { culture = null; }
                    var v = fromValue;
                    var cInfo = !addThousandsSeparator ? null : culture || System.Globalization.CultureInfo.invariantCulture;
                    var t = DG.Tweening.DOTween.To$2(function () {
                        return v;
                    }, function (x) {
                        v = x;
                        target.text = addThousandsSeparator ? System.Int32.format(v, "N0", cInfo) : Bridge.toString(v);
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(System.Int32,System.Int32,DG.Tweening.Plugins.Options.NoOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOCounter:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOText:static start.*/
                /**
                 * Tweens a Text's text to the given value.
                 Also stores the Text as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Text}               target             
                 * @param   {string}                            endValue           The end string to tween to
                 * @param   {number}                            duration           The duration of the tween
                 * @param   {boolean}                           richTextEnabled    If TRUE (default), rich text will be interpreted correctly while animated,
                 otherwise all tags will be considered as normal text
                 * @param   {DG.Tweening.ScrambleMode}          scrambleMode       The type of scramble mode to use, if any
                 * @param   {string}                            scrambleChars      A string containing the characters to use for scrambling.
                 Use as many characters as possible (minimum 10) because DOTween uses a fast scramble mode which gives better results with more characters.
                 Leave it to NULL (default) to use default ones
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOText: function (target, endValue, duration, richTextEnabled, scrambleMode, scrambleChars) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOText", this ); }

                    if (richTextEnabled === void 0) { richTextEnabled = true; }
                    if (scrambleMode === void 0) { scrambleMode = 0; }
                    if (scrambleChars === void 0) { scrambleChars = null; }
                    if (endValue == null) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogWarning("You can't pass a NULL string to DOText: an empty string will be used instead to avoid errors");
                        }
                        endValue = "";
                    }
                    var t = DG.Tweening.DOTween.To$5(function () {
                        return target.text;
                    }, function (x) {
                        target.text = x;
                    }, endValue, duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$3(t, richTextEnabled, scrambleMode, scrambleChars), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOText:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor:static start.*/
                /**
                 * Tweens a Graphic's color to the given value,
                 in a way that allows other DOBlendableColor tweens to work together on the same target,
                 instead than fight each other as multiple DOColor would do.
                 Also stores the Graphic as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Graphic}    target      
                 * @param   {UnityEngine.Color}         endValue    The value to tween to
                 * @param   {number}                    duration    The duration of the tween
                 * @return  {DG.Tweening.Tweener}
                 */
                DOBlendableColor: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOBlendableColor", this ); }

                    var $t;
                    endValue = ($t = target.color, new pc.Color( endValue.r - $t.r, endValue.g - $t.g, endValue.b - $t.b, endValue.a - $t.a ));
                    var to = new pc.Color( 0, 0, 0, 0 );
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.Core.Extensions.Blendable(UnityEngine.Color, UnityEngine.Color, DG.Tweening.Plugins.Options.ColorOptions, DG.Tweening.DOTween.To$8(function () {
                        return to;
                    }, function (x) {
                        var $t1;
                        var diff = new pc.Color( x.r - to.r, x.g - to.g, x.b - to.b, x.a - to.a );
                        to = x.$clone();
                        target.color = ($t1 = target.color.$clone(), new pc.Color( $t1.r + diff.$clone().r, $t1.g + diff.$clone().g, $t1.b + diff.$clone().b, $t1.a + diff.$clone().a ));
                    }, endValue.$clone(), duration)), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor$1:static start.*/
                /**
                 * Tweens a Image's color to the given value,
                 in a way that allows other DOBlendableColor tweens to work together on the same target,
                 instead than fight each other as multiple DOColor would do.
                 Also stores the Image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Image}    target      
                 * @param   {UnityEngine.Color}       endValue    The value to tween to
                 * @param   {number}                  duration    The duration of the tween
                 * @return  {DG.Tweening.Tweener}
                 */
                DOBlendableColor$1: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOBlendableColor$1", this ); }

                    var $t;
                    endValue = ($t = target.color, new pc.Color( endValue.r - $t.r, endValue.g - $t.g, endValue.b - $t.b, endValue.a - $t.a ));
                    var to = new pc.Color( 0, 0, 0, 0 );
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.Core.Extensions.Blendable(UnityEngine.Color, UnityEngine.Color, DG.Tweening.Plugins.Options.ColorOptions, DG.Tweening.DOTween.To$8(function () {
                        return to;
                    }, function (x) {
                        var $t1;
                        var diff = new pc.Color( x.r - to.r, x.g - to.g, x.b - to.b, x.a - to.a );
                        to = x.$clone();
                        target.color = ($t1 = target.color.$clone(), new pc.Color( $t1.r + diff.$clone().r, $t1.g + diff.$clone().g, $t1.b + diff.$clone().b, $t1.a + diff.$clone().a ));
                    }, endValue.$clone(), duration)), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor$1:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor$2:static start.*/
                /**
                 * Tweens a Text's color BY the given value,
                 in a way that allows other DOBlendableColor tweens to work together on the same target,
                 instead than fight each other as multiple DOColor would do.
                 Also stores the Text as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.UI.Text}    target      
                 * @param   {UnityEngine.Color}      endValue    The value to tween to
                 * @param   {number}                 duration    The duration of the tween
                 * @return  {DG.Tweening.Tweener}
                 */
                DOBlendableColor$2: function (target, endValue, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOBlendableColor$2", this ); }

                    var $t;
                    endValue = ($t = target.color, new pc.Color( endValue.r - $t.r, endValue.g - $t.g, endValue.b - $t.b, endValue.a - $t.a ));
                    var to = new pc.Color( 0, 0, 0, 0 );
                    return DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.Core.Extensions.Blendable(UnityEngine.Color, UnityEngine.Color, DG.Tweening.Plugins.Options.ColorOptions, DG.Tweening.DOTween.To$8(function () {
                        return to;
                    }, function (x) {
                        var $t1;
                        var diff = new pc.Color( x.r - to.r, x.g - to.g, x.b - to.b, x.a - to.a );
                        to = x.$clone();
                        target.color = ($t1 = target.color.$clone(), new pc.Color( $t1.r + diff.$clone().r, $t1.g + diff.$clone().g, $t1.b + diff.$clone().b, $t1.a + diff.$clone().a ));
                    }, endValue.$clone(), duration)), target);
                },
                /*DG.Tweening.DOTweenModuleUI.DOBlendableColor$2:static end.*/

                /*DG.Tweening.DOTweenModuleUI.DOShapeCircle:static start.*/
                /**
                 * Tweens a RectTransform's anchoredPosition so that it draws a circle around the given center.
                 Also stores the RectTransform as the tween's target so it can be used for filtered operations.<p />
                 IMPORTANT: SetFrom(value) requires a {@link } instead of a float, where the X property represents the "from degrees value"
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI
                 * @memberof DG.Tweening.DOTweenModuleUI
                 * @param   {UnityEngine.RectTransform}         target             
                 * @param   {UnityEngine.Vector2}               center             Circle-center/pivot around which to rotate (in UI anchoredPosition coordinates)
                 * @param   {number}                            endValueDegrees    The end value degrees to reach (to rotate counter-clockwise pass a negative value)
                 * @param   {number}                            duration           The duration of the tween
                 * @param   {boolean}                           relativeCenter     If TRUE the {@link } coordinates will be considered as relative to the target's current anchoredPosition
                 * @param   {boolean}                           snapping           If TRUE the tween will smoothly snap all values to integers
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOShapeCircle: function (target, center, endValueDegrees, duration, relativeCenter, snapping) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI#DOShapeCircle", this ); }

                    if (relativeCenter === void 0) { relativeCenter = false; }
                    if (snapping === void 0) { snapping = false; }
                    var t = DG.Tweening.DOTween.To(UnityEngine.Vector2, UnityEngine.Vector2, DG.Tweening.Plugins.CircleOptions, DG.Tweening.Plugins.CirclePlugin.Get(), function () {
                        return target.anchoredPosition;
                    }, function (x) {
                        target.anchoredPosition = x.$clone();
                    }, center.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Tweener, DG.Tweening.TweenSettingsExtensions.SetOptions$7(t, endValueDegrees, relativeCenter, snapping), target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUI.DOShapeCircle:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleUI end.*/

    /*DG.Tweening.DOTweenModuleUI+Utils start.*/
    Bridge.define("DG.Tweening.DOTweenModuleUI.Utils", {
        $kind: 1002,
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleUI+Utils.SwitchToRectTransform:static start.*/
                /**
                 * Converts the anchoredPosition of the first RectTransform to the second RectTransform,
                 taking into consideration offset, anchors and pivot, and returns the new anchoredPosition
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUI.Utils
                 * @memberof DG.Tweening.DOTweenModuleUI.Utils
                 * @param   {UnityEngine.RectTransform}    from    
                 * @param   {UnityEngine.RectTransform}    to
                 * @return  {UnityEngine.Vector2}
                 */
                SwitchToRectTransform: function (from, to) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUI.Utils#SwitchToRectTransform", this ); }

                    var localPoint = { v : new UnityEngine.Vector2() };
                    var fromPivotDerivedOffset = new pc.Vec2( from.rect.width * 0.5 + from.rect.xMin, from.rect.height * 0.5 + from.rect.yMin );
                    var screenP = UnityEngine.RectTransformUtility.WorldToScreenPoint(null, from.position);
                    screenP = screenP.$clone().add( fromPivotDerivedOffset.$clone() );
                    UnityEngine.RectTransformUtility.ScreenPointToLocalPointInRectangle(to, screenP, null, localPoint);
                    var pivotDerivedOffset = new pc.Vec2( to.rect.width * 0.5 + to.rect.xMin, to.rect.height * 0.5 + to.rect.yMin );
                    return to.anchoredPosition.$clone().add( localPoint.v ).sub( pivotDerivedOffset );
                },
                /*DG.Tweening.DOTweenModuleUI+Utils.SwitchToRectTransform:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleUI+Utils end.*/

    /*DG.Tweening.DOTweenModuleUnityVersion start.*/
    /** @namespace DG.Tweening */

    /**
     * Shortcuts/functions that are not strictly related to specific Modules
     but are available only on some Unity versions
     *
     * @static
     * @abstract
     * @public
     * @class DG.Tweening.DOTweenModuleUnityVersion
     */
    Bridge.define("DG.Tweening.DOTweenModuleUnityVersion", {
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleUnityVersion.DOGradientColor:static start.*/
                /**
                 * Tweens a Material's color using the given gradient
                 (NOTE 1: only uses the colors of the gradient, not the alphas - NOTE 2: creates a Sequence, not a Tweener).
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {UnityEngine.Material}    target      
                 * @param   {pc.ColorGradient}        gradient    The gradient to use
                 * @param   {number}                  duration    The duration of the tween
                 * @return  {DG.Tweening.Sequence}
                 */
                DOGradientColor: function (target, gradient, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#DOGradientColor", this ); }

                    var s = DG.Tweening.DOTween.Sequence();
                    var colors = gradient.colorKeys;
                    var len = colors.length;
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        var c = colors[i];
                        if (i === 0 && c.time <= 0) {
                            target.color = c.color.$clone();
                            continue;
                        }
                        var colorDuration = i === ((len - 1) | 0) ? duration - DG.Tweening.TweenExtensions.Duration(s, false) : duration * (i === 0 ? c.time : c.time - colors[((i - 1) | 0)].time);
                        DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.ShortcutExtensions.DOColor$3(target, c.color.$clone(), colorDuration), DG.Tweening.Ease.Linear));
                    }
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, s, target);
                    return s;
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.DOGradientColor:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.DOGradientColor$1:static start.*/
                /**
                 * Tweens a Material's named color property using the given gradient
                 (NOTE 1: only uses the colors of the gradient, not the alphas - NOTE 2: creates a Sequence, not a Tweener).
                 Also stores the image as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {UnityEngine.Material}    target      
                 * @param   {pc.ColorGradient}        gradient    The gradient to use
                 * @param   {string}                  property    The name of the material property to tween (like _Tint or _SpecColor)
                 * @param   {number}                  duration    The duration of the tween
                 * @return  {DG.Tweening.Sequence}
                 */
                DOGradientColor$1: function (target, gradient, property, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#DOGradientColor$1", this ); }

                    var s = DG.Tweening.DOTween.Sequence();
                    var colors = gradient.colorKeys;
                    var len = colors.length;
                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        var c = colors[i];
                        if (i === 0 && c.time <= 0) {
                            target.SetColor$1(property, c.color);
                            continue;
                        }
                        var colorDuration = i === ((len - 1) | 0) ? duration - DG.Tweening.TweenExtensions.Duration(s, false) : duration * (i === 0 ? c.time : c.time - colors[((i - 1) | 0)].time);
                        DG.Tweening.TweenSettingsExtensions.Append(s, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.ShortcutExtensions.DOColor$4(target, c.color.$clone(), property, colorDuration), DG.Tweening.Ease.Linear));
                    }
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Sequence, s, target);
                    return s;
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.DOGradientColor$1:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForCompletion:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed or complete.
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForCompletion(true);</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForCompletion: function (t, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForCompletion", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForCompletion(t);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForCompletion:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForRewind:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed or rewinded.
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForRewind();</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForRewind: function (t, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForRewind", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForRewind(t);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForRewind:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForKill:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed.
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForKill();</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForKill: function (t, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForKill", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForKill(t);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForKill:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForElapsedLoops:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed or has gone through the given amount of loops.
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForElapsedLoops(2);</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {number}                                elapsedLoops                    Elapsed loops to wait for
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForElapsedLoops: function (t, elapsedLoops, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForElapsedLoops", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops(t, elapsedLoops);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForElapsedLoops:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForPosition:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed
                 or has reached the given time position (loops included, delays excluded).
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForPosition(2.5f);</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {number}                                position                        Position (loops included, delays excluded) to wait for
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForPosition: function (t, position, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForPosition", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForPosition(t, position);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForPosition:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForStart:static start.*/
                /**
                 * Returns a {@link } that waits until the tween is killed or started
                 (meaning when the tween is set in a playing state the first time, after any eventual delay).
                 It can be used inside a coroutine as a yield.
                 <p>Example usage:</p><pre><code>yield return myTween.WaitForStart();</code></pre>
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {DG.Tweening.Tween}                     t                               
                 * @param   {boolean}                               returnCustomYieldInstruction
                 * @return  {UnityEngine.CustomYieldInstruction}
                 */
                WaitForStart: function (t, returnCustomYieldInstruction) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#WaitForStart", this ); }

                    if (!t.active) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogInvalidTween(t);
                        }
                        return null;
                    }
                    return new DG.Tweening.DOTweenCYInstruction.WaitForStart(t);
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.WaitForStart:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.DOOffset:static start.*/
                /**
                 * Tweens a Material's named texture offset property with the given ID to the given value.
                 Also stores the material as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {UnityEngine.Material}              target        
                 * @param   {UnityEngine.Vector2}               endValue      The end value to reach
                 * @param   {number}                            propertyID    The ID of the material property to tween (also called nameID in Unity's manual)
                 * @param   {number}                            duration      The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOOffset: function (target, endValue, propertyID, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#DOOffset", this ); }

                    if (!target.HasProperty(propertyID)) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogMissingMaterialProperty(propertyID);
                        }
                        return null;
                    }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.GetTextureOffset(propertyID);
                    }, function (x) {
                        target.SetTextureOffset(propertyID, x);
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.DOOffset:static end.*/

                /*DG.Tweening.DOTweenModuleUnityVersion.DOTiling:static start.*/
                /**
                 * Tweens a Material's named texture scale property with the given ID to the given value.
                 Also stores the material as the tween's target so it can be used for filtered operations
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUnityVersion
                 * @memberof DG.Tweening.DOTweenModuleUnityVersion
                 * @param   {UnityEngine.Material}              target        
                 * @param   {UnityEngine.Vector2}               endValue      The end value to reach
                 * @param   {number}                            propertyID    The ID of the material property to tween (also called nameID in Unity's manual)
                 * @param   {number}                            duration      The duration of the tween
                 * @return  {DG.Tweening.Core.TweenerCore$3}
                 */
                DOTiling: function (target, endValue, propertyID, duration) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUnityVersion#DOTiling", this ); }

                    if (!target.HasProperty(propertyID)) {
                        if (DG.Tweening.Core.Debugger.logPriority > 0) {
                            DG.Tweening.Core.Debugger.LogMissingMaterialProperty(propertyID);
                        }
                        return null;
                    }
                    var t = DG.Tweening.DOTween.To$11(function () {
                        return target.GetTextureScale(propertyID);
                    }, function (x) {
                        target.SetTextureScale(propertyID, x);
                    }, endValue.$clone(), duration);
                    DG.Tweening.TweenSettingsExtensions.SetTarget(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions), t, target);
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUnityVersion.DOTiling:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleUnityVersion end.*/

    /*DG.Tweening.DOTweenModuleUtils start.*/
    /**
     * Utility functions that deal with available Modules.
     Modules defines:
     - DOTAUDIO
     - DOTPHYSICS
     - DOTPHYSICS2D
     - DOTSPRITE
     - DOTUI
     Extra defines set and used for implementation of external assets:
     - DOTWEEN_TMP ► TextMesh Pro
     - DOTWEEN_TK2D ► 2D Toolkit
     *
     * @static
     * @abstract
     * @public
     * @class DG.Tweening.DOTweenModuleUtils
     */
    Bridge.define("DG.Tweening.DOTweenModuleUtils", {
        statics: {
            fields: {
                _initialized: false
            },
            methods: {
                /*DG.Tweening.DOTweenModuleUtils.Init:static start.*/
                /**
                 * Called via Reflection by DOTweenComponent on Awake
                 *
                 * @static
                 * @public
                 * @this DG.Tweening.DOTweenModuleUtils
                 * @memberof DG.Tweening.DOTweenModuleUtils
                 * @return  {void}
                 */
                Init: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils#Init", this ); }

                    if (DG.Tweening.DOTweenModuleUtils._initialized) {
                        return;
                    }

                    DG.Tweening.DOTweenModuleUtils._initialized = true;
                    DG.Tweening.Core.DOTweenExternalCommand.addSetOrientationOnPath(DG.Tweening.DOTweenModuleUtils.Physics.SetOrientationOnPath);

                },
                /*DG.Tweening.DOTweenModuleUtils.Init:static end.*/

                /*DG.Tweening.DOTweenModuleUtils.Preserver:static start.*/
                Preserver: function () {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils#Preserver", this ); }

                    var loadedAssemblies = System.AppDomain.getAssemblies();
                    var mi = Bridge.Reflection.getMembers(UnityEngine.MonoBehaviour, 8, 284, "Stub");
                },
                /*DG.Tweening.DOTweenModuleUtils.Preserver:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleUtils end.*/

    /*DG.Tweening.DOTweenModuleUtils+Physics start.*/
    Bridge.define("DG.Tweening.DOTweenModuleUtils.Physics", {
        $kind: 1002,
        statics: {
            methods: {
                /*DG.Tweening.DOTweenModuleUtils+Physics.SetOrientationOnPath:static start.*/
                SetOrientationOnPath: function (options, t, newRot, trans) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils.Physics#SetOrientationOnPath", this ); }

                    if (options.isRigidbody) {
                        Bridge.cast(t.target, UnityEngine.Rigidbody).rotation = newRot.$clone();
                    } else {
                        trans.rotation = newRot.$clone();
                    }
                },
                /*DG.Tweening.DOTweenModuleUtils+Physics.SetOrientationOnPath:static end.*/

                /*DG.Tweening.DOTweenModuleUtils+Physics.HasRigidbody2D:static start.*/
                HasRigidbody2D: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils.Physics#HasRigidbody2D", this ); }

                    return UnityEngine.Component.op_Inequality(target.GetComponent(UnityEngine.Rigidbody2D), null);
                },
                /*DG.Tweening.DOTweenModuleUtils+Physics.HasRigidbody2D:static end.*/

                /*DG.Tweening.DOTweenModuleUtils+Physics.HasRigidbody:static start.*/
                HasRigidbody: function (target) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils.Physics#HasRigidbody", this ); }

                    return UnityEngine.Component.op_Inequality(target.GetComponent(UnityEngine.Rigidbody), null);
                },
                /*DG.Tweening.DOTweenModuleUtils+Physics.HasRigidbody:static end.*/

                /*DG.Tweening.DOTweenModuleUtils+Physics.CreateDOTweenPathTween:static start.*/
                CreateDOTweenPathTween: function (target, tweenRigidbody, isLocal, path, duration, pathMode) {
if ( TRACE ) { TRACE( "DG.Tweening.DOTweenModuleUtils.Physics#CreateDOTweenPathTween", this ); }

                    var t = null;
                    var rBodyFoundAndTweened = false;
                    if (tweenRigidbody) {
                        var rBody = target.GetComponent(UnityEngine.Rigidbody);
                        if (UnityEngine.Component.op_Inequality(rBody, null)) {
                            rBodyFoundAndTweened = true;
                            t = isLocal ? DG.Tweening.DOTweenModulePhysics.DOLocalPath$1(rBody, path, duration, pathMode) : DG.Tweening.DOTweenModulePhysics.DOPath$1(rBody, path, duration, pathMode);
                        }
                    }
                    if (!rBodyFoundAndTweened && tweenRigidbody) {
                        var rBody2D = target.GetComponent(UnityEngine.Rigidbody2D);
                        if (UnityEngine.Component.op_Inequality(rBody2D, null)) {
                            rBodyFoundAndTweened = true;
                            t = isLocal ? DG.Tweening.DOTweenModulePhysics2D.DOLocalPath$1(rBody2D, path, duration, pathMode) : DG.Tweening.DOTweenModulePhysics2D.DOPath$1(rBody2D, path, duration, pathMode);
                        }
                    }
                    if (!rBodyFoundAndTweened) {
                        t = isLocal ? DG.Tweening.ShortcutExtensions.DOLocalPath(target.transform, path, duration, pathMode) : DG.Tweening.ShortcutExtensions.DOPath(target.transform, path, duration, pathMode);
                    }
                    return t;
                },
                /*DG.Tweening.DOTweenModuleUtils+Physics.CreateDOTweenPathTween:static end.*/


            }
        }
    });
    /*DG.Tweening.DOTweenModuleUtils+Physics end.*/

    /*GameManager start.*/
    Bridge.define("GameManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            handPointer: null,
            handRenderer: null,
            Board: null,
            highlight: null,
            handMat: null,
            IsHintActive: false,
            hintedBrick: null,
            hintDelay: 0,
            hintTimer: 0,
            hintMoveDirection: null,
            hintLoopSequence: null,
            HasUsedStartingHint: false,
            startingBrick: null,
            startingDirection: null,
            directions: null
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "GameManager#init", this ); }

                this.hintMoveDirection = new UnityEngine.Vector3();
                this.startingDirection = new UnityEngine.Vector3();
                this.IsHintActive = false;
                this.hintDelay = 3.0;
                this.hintTimer = 0.0;
                this.HasUsedStartingHint = false;
                this.directions = System.Array.init([
                    new pc.Vec3( 0, 0, 1 ), 
                    new pc.Vec3( 0, 0, -1 ), 
                    pc.Vec3.LEFT.clone(), 
                    pc.Vec3.RIGHT.clone()
                ], UnityEngine.Vector3);
            }
        },
        methods: {
            /*GameManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "GameManager#Awake", this ); }

                GameManager.Instance = this;
                this.handPointer.gameObject.SetActive(false);
            },
            /*GameManager.Awake end.*/

            /*GameManager.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "GameManager#Start", this ); }

                this.handMat = this.handRenderer.material;
                this.HasUsedStartingHint = false;
                this.IsHintActive = true;
                this.hintTimer = this.hintDelay;
            },
            /*GameManager.Start end.*/

            /*GameManager.Update start.*/
            Update: function () {
if ( TRACE ) { TRACE( "GameManager#Update", this ); }

                if (UnityEngine.Object.op_Implicit(this.startingBrick) && !this.HasUsedStartingHint) {
                    if (!this.startingBrick.gameObject.activeSelf) {
                        this.HasUsedStartingHint = true;
                        this.startingBrick = null;
                        this.hintedBrick = null;
                        this.handPointer.gameObject.SetActive(false);
                    }
                }
                if (!this.IsHintActive) {
                    return;
                }
                this.hintTimer += UnityEngine.Time.deltaTime;
                if (this.hintTimer >= this.hintDelay) {
                    this.hintTimer = 0;
                    this.TryFindValidMove();
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.hintedBrick, null) && !this.handPointer.gameObject.activeSelf) {
                    this.StartHintHandAnimationLoop();
                    this.HighlightGateColor();
                }
            },
            /*GameManager.Update end.*/

            /*GameManager.HighlightGateColor start.*/
            HighlightGateColor: function () {
if ( TRACE ) { TRACE( "GameManager#HighlightGateColor", this ); }

                //Red
                if (this.hintedBrick.BrickColor === BrickColor.Red) {
                    this.StartGateHighlight(0);
                }
                //Green
                if (this.hintedBrick.BrickColor === BrickColor.Green) {
                    this.StartGateHighlight(1);
                }
                //Blue
                if (this.hintedBrick.BrickColor === BrickColor.Blue) {
                    this.StartGateHighlight(2);
                }
                //Yellow
                if (this.hintedBrick.BrickColor === BrickColor.Yellow) {
                    this.StartGateHighlight(3);
                }
            },
            /*GameManager.HighlightGateColor end.*/

            /*GameManager.StartGateHighlight start.*/
            StartGateHighlight: function (index) {
if ( TRACE ) { TRACE( "GameManager#StartGateHighlight", this ); }

                if (this.highlight == null || index < 0 || index >= this.highlight.length || UnityEngine.GameObject.op_Equality(this.highlight[index], null)) {
                    return;
                }

                var target = this.highlight[index];
                var renderer = target.GetComponent(UnityEngine.MeshRenderer);
                if (UnityEngine.Component.op_Equality(renderer, null)) {
                    return;
                }

                var material = renderer.material;
                DG.Tweening.ShortcutExtensions.DOKill$1(material);
                DG.Tweening.ShortcutExtensions.DOKill(target.transform);
                target.SetActive(true);
                this.SetMaterialAlpha(material, 0.0);
                DG.Tweening.TweenSettingsExtensions.SetLoops$1(DG.Tweening.Core.TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions), DG.Tweening.ShortcutExtensions.DOFade$1(material, 0.5, 0.5), -1, DG.Tweening.LoopType.Yoyo);
            },
            /*GameManager.StartGateHighlight end.*/

            /*GameManager.StopGateHighlights start.*/
            StopGateHighlights: function () {
if ( TRACE ) { TRACE( "GameManager#StopGateHighlights", this ); }

                var $t;
                if (this.highlight == null) {
                    return;
                }

                $t = Bridge.getEnumerator(this.highlight);
                try {
                    while ($t.moveNext()) {
                        var h = $t.Current;
                        if (UnityEngine.GameObject.op_Equality(h, null)) {
                            continue;
                        }

                        var renderer = h.GetComponent(UnityEngine.MeshRenderer);
                        if (UnityEngine.Component.op_Inequality(renderer, null)) {
                            var material = renderer.material;
                            DG.Tweening.ShortcutExtensions.DOKill$1(material);
                            this.SetMaterialAlpha(material, 0.0);
                        }

                        DG.Tweening.ShortcutExtensions.DOKill(h.transform);
                        h.SetActive(false);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*GameManager.StopGateHighlights end.*/

            /*GameManager.SetMaterialAlpha start.*/
            SetMaterialAlpha: function (material, alpha) {
if ( TRACE ) { TRACE( "GameManager#SetMaterialAlpha", this ); }

                var color = material.color.$clone();
                color.a = alpha;
                material.color = color.$clone();
            },
            /*GameManager.SetMaterialAlpha end.*/

            /*GameManager.TryFindValidMove start.*/
            TryFindValidMove: function () {
if ( TRACE ) { TRACE( "GameManager#TryFindValidMove", this ); }

                var $t;
                if (!this.HasUsedStartingHint) {
                    this.hintedBrick = this.startingBrick;
                    this.hintMoveDirection = new pc.Vec3( Math.round(this.startingDirection.x), 0, Math.round(this.startingDirection.z) ).clone().normalize().$clone();
                    this.HighlightGateColor();
                    return;
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.hintedBrick, null)) {
                    return;
                }
                this.hintedBrick = null;
                var boardTransform = this.Board.transform;
                var childCount = boardTransform.childCount;
                var boardBricks = System.Array.init(childCount, null, UnityEngine.GameObject);
                for (var i = 0; i < childCount; i = (i + 1) | 0) {
                    boardBricks[i] = boardTransform.GetChild(i).gameObject;
                }
                if (boardBricks.length === 0) {
                    return;
                }
                for (var i1 = (boardBricks.length - 1) | 0; i1 > 0; i1 = (i1 - 1) | 0) {
                    var rand = UnityEngine.Random.Range(0, ((i1 + 1) | 0));
                    Bridge.Deconstruct(new (System.ValueTuple$2(UnityEngine.GameObject,UnityEngine.GameObject)).$ctor1(boardBricks[rand], boardBricks[i1]).$clone(), Bridge.ref(boardBricks, i1), Bridge.ref(boardBricks, rand));
                }
                $t = Bridge.getEnumerator(boardBricks);
                try {
                    while ($t.moveNext()) {
                        var brickObj = $t.Current;
                        if (UnityEngine.GameObject.op_Equality(brickObj, null) || !brickObj.activeInHierarchy) {
                            continue;
                        }
                        var brick = { };
                        if (!brickObj.TryGetComponent$1(Brick, brick)) {
                            continue;
                        }
                        var gateDir = this.GetDirectionToMatchingGate(brick.v);
                        if (!pc.Vec3.equals( gateDir, pc.Vec3.ZERO.clone() ) && this.CanBrickMove(brick.v, gateDir)) {
                            this.hintedBrick = brick.v;
                            this.hintMoveDirection = gateDir.$clone();
                            return;
                        }
                        this.ShuffleDirections();
                        for (var d = 0; d < this.directions.length; d = (d + 1) | 0) {
                            if (this.CanBrickMove(brick.v, this.directions[d])) {
                                this.hintedBrick = brick.v;
                                this.hintMoveDirection = this.directions[d].$clone();
                                return;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*GameManager.TryFindValidMove end.*/

            /*GameManager.GetDirectionToMatchingGate start.*/
            GetDirectionToMatchingGate: function (brick) {
if ( TRACE ) { TRACE( "GameManager#GetDirectionToMatchingGate", this ); }

                var $t;
                var brickCenter = this.GetBrickCenter(brick);
                var bestGate = null;
                var bestDist = 3.40282347E+38;
                $t = Bridge.getEnumerator(Gate.allGates);
                try {
                    while ($t.moveNext()) {
                        var gate = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Equality(gate, null)) {
                            continue;
                        }
                        if (!gate.MatchesColor(brick.brickColor)) {
                            continue;
                        }
                        var dist = (gate.VfxPosition.$clone().sub( brickCenter )).lengthSq();
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestGate = gate;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                if (UnityEngine.MonoBehaviour.op_Equality(bestGate, null)) {
                    return pc.Vec3.ZERO.clone();
                }
                var delta = bestGate.VfxPosition.$clone().sub( brickCenter );
                var primary = Math.abs(delta.x) >= Math.abs(delta.z) ? (delta.x >= 0 ? pc.Vec3.RIGHT.clone() : pc.Vec3.LEFT.clone()) : (delta.z >= 0 ? new pc.Vec3( 0, 0, 1 ) : new pc.Vec3( 0, 0, -1 ));
                if (this.CanBrickMove(brick, primary)) {
                    return primary.$clone();
                }
                var secondary = Math.abs(delta.x) >= Math.abs(delta.z) ? (delta.z >= 0 ? new pc.Vec3( 0, 0, 1 ) : new pc.Vec3( 0, 0, -1 )) : (delta.x >= 0 ? pc.Vec3.RIGHT.clone() : pc.Vec3.LEFT.clone());
                if (this.CanBrickMove(brick, secondary)) {
                    return secondary.$clone();
                }
                return pc.Vec3.ZERO.clone();
            },
            /*GameManager.GetDirectionToMatchingGate end.*/

            /*GameManager.GetBrickCenter start.*/
            GetBrickCenter: function (brick) {
if ( TRACE ) { TRACE( "GameManager#GetBrickCenter", this ); }

                var cells = brick.GetComponentsInChildren(BrickCell);
                if (cells == null || cells.length === 0) {
                    return brick.transform.position.$clone();
                }
                var sum = pc.Vec3.ZERO.clone();
                for (var i = 0; i < cells.length; i = (i + 1) | 0) {
                    sum = sum.$clone().add( cells[i].transform.position.$clone() );
                }
                return sum.$clone().scale( 1.0 / ( cells.length ) );
            },
            /*GameManager.GetBrickCenter end.*/

            /*GameManager.ShuffleDirections start.*/
            ShuffleDirections: function () {
if ( TRACE ) { TRACE( "GameManager#ShuffleDirections", this ); }

                for (var i = (this.directions.length - 1) | 0; i > 0; i = (i - 1) | 0) {
                    var rand = UnityEngine.Random.Range(0, ((i + 1) | 0));
                    var temp = this.directions[i].$clone();
                    this.directions[i] = this.directions[rand].$clone();
                    this.directions[rand] = temp.$clone();
                }
            },
            /*GameManager.ShuffleDirections end.*/

            /*GameManager.CanBrickMove start.*/
            CanBrickMove: function (brick, direction) {
if ( TRACE ) { TRACE( "GameManager#CanBrickMove", this ); }

                var cells = brick.GetComponentsInChildren(BrickCell);
                if (cells == null || cells.length === 0) {
                    return false;
                }
                for (var i = 0; i < cells.length; i = (i + 1) | 0) {
                    var cellWorld = cells[i].transform.position.$clone();
                    var targetPos = cellWorld.$clone().add( direction );
                    var nextSlot = BoardManager.Instance.GetSlotAtPosition(targetPos);
                    if (UnityEngine.MonoBehaviour.op_Equality(nextSlot, null)) {
                        return false;
                    }
                    if (nextSlot.IsOccupied && UnityEngine.MonoBehaviour.op_Inequality(nextSlot.occupyingBrick, brick)) {
                        return false;
                    }
                }

                return true;
            },
            /*GameManager.CanBrickMove end.*/

            /*GameManager.StartHintHandAnimationLoop start.*/
            StartHintHandAnimationLoop: function () {
if ( TRACE ) { TRACE( "GameManager#StartHintHandAnimationLoop", this ); }

                this.handPointer.gameObject.SetActive(true);
                this.hintLoopSequence != null ? DG.Tweening.TweenExtensions.Kill(this.hintLoopSequence) : null;
                this.hintLoopSequence = DG.Tweening.TweenSettingsExtensions.SetLoops(DG.Tweening.Sequence, DG.Tweening.DOTween.Sequence(), -1);
                var directionAmplitude = 3.0;
                var brickPos = this.hintedBrick.transform.position.$clone().add( pc.Vec3.UP.clone().clone().scale( 0.2 ) );
                var targetPos = brickPos.$clone().add( (this.hintMoveDirection.$clone().clone().scale( directionAmplitude )) );
                this.handPointer.position = brickPos.$clone();
                this.SetAlpha(0.0);
                var totalDuration = 1.5;
                var fadeInDuration = 0.25;
                var moveDuration = 0.75;
                var intervalDuration = 0.1;
                var fadeOutDuration = totalDuration - (fadeInDuration + moveDuration + intervalDuration);
                DG.Tweening.TweenSettingsExtensions.Append(this.hintLoopSequence, DG.Tweening.DOTween.To$4(Bridge.fn.bind(this, function () {
                    return this.GetAlpha();
                }), Bridge.fn.bind(this, function (x) {
                    this.SetAlpha(x);
                }), 1.0, fadeInDuration));
                DG.Tweening.TweenSettingsExtensions.Append(this.hintLoopSequence, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(this.handPointer, targetPos.$clone(), moveDuration), DG.Tweening.Ease.InOutSine));
                DG.Tweening.TweenSettingsExtensions.AppendInterval(this.hintLoopSequence, intervalDuration);
                DG.Tweening.TweenSettingsExtensions.Append(this.hintLoopSequence, DG.Tweening.DOTween.To$4(Bridge.fn.bind(this, function () {
                    return this.GetAlpha();
                }), Bridge.fn.bind(this, function (x) {
                    this.SetAlpha(x);
                }), 0.0, fadeOutDuration));
                DG.Tweening.TweenSettingsExtensions.AppendCallback(this.hintLoopSequence, Bridge.fn.bind(this, function () {
                    if (UnityEngine.MonoBehaviour.op_Inequality(this.hintedBrick, null)) {
                        this.handPointer.position = this.hintedBrick.transform.position.$clone().add( pc.Vec3.UP.clone().clone().scale( 0.2 ) );
                    }
                }));
            },
            /*GameManager.StartHintHandAnimationLoop end.*/

            /*GameManager.SetAlpha start.*/
            SetAlpha: function (value) {
if ( TRACE ) { TRACE( "GameManager#SetAlpha", this ); }

                var c = this.handMat.color.$clone();
                c.a = value;
                this.handMat.color = c.$clone();
            },
            /*GameManager.SetAlpha end.*/

            /*GameManager.GetAlpha start.*/
            GetAlpha: function () {
if ( TRACE ) { TRACE( "GameManager#GetAlpha", this ); }

                return this.handMat.color.a;
            },
            /*GameManager.GetAlpha end.*/

            /*GameManager.StopHint start.*/
            StopHint: function () {
if ( TRACE ) { TRACE( "GameManager#StopHint", this ); }

                this.hintTimer = 0.0;
                if (this.hintLoopSequence != null && DG.Tweening.TweenExtensions.IsActive(this.hintLoopSequence)) {
                    DG.Tweening.TweenExtensions.Kill(this.hintLoopSequence);
                }
                this.handPointer.gameObject.SetActive(false);
                this.IsHintActive = false;
                this.HasUsedStartingHint = true;
                this.hintedBrick = null;
                this.StopGateHighlights();
            },
            /*GameManager.StopHint end.*/

            /*GameManager.StartHint start.*/
            StartHint: function () {
if ( TRACE ) { TRACE( "GameManager#StartHint", this ); }

                this.hintTimer = 0.0;
                if (this.hintLoopSequence != null && DG.Tweening.TweenExtensions.IsActive(this.hintLoopSequence)) {
                    DG.Tweening.TweenExtensions.Kill(this.hintLoopSequence);
                }
                this.handPointer.gameObject.SetActive(false);
                this.IsHintActive = true;
                this.HasUsedStartingHint = true;
                this.hintedBrick = null;
            },
            /*GameManager.StartHint end.*/

            /*GameManager.StopTutorial start.*/
            StopTutorial: function () {
if ( TRACE ) { TRACE( "GameManager#StopTutorial", this ); }

                this.StopHint();
            },
            /*GameManager.StopTutorial end.*/

            /*GameManager.StartTutorial start.*/
            StartTutorial: function () {
if ( TRACE ) { TRACE( "GameManager#StartTutorial", this ); }

                this.StartHint();
            },
            /*GameManager.StartTutorial end.*/


        }
    });
    /*GameManager end.*/

    /*Gate start.*/
    Bridge.define("Gate", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                ColorMatchTolerance: 0,
                allGates: null
            },
            ctors: {
                init: function () {
if ( TRACE ) { TRACE( "Gate#init", this ); }

                    this.ColorMatchTolerance = 0.0015;
                    this.allGates = new (System.Collections.Generic.List$1(Gate)).ctor();
                }
            },
            methods: {
                /*Gate.StartBounceMatchingGates:static start.*/
                StartBounceMatchingGates: function (color) {
if ( TRACE ) { TRACE( "Gate#StartBounceMatchingGates", this ); }

                    var $t;
                    $t = Bridge.getEnumerator(Gate.allGates);
                    try {
                        while ($t.moveNext()) {
                            var gate = $t.Current;
                            if (gate.MatchesColor(color)) {
                                gate.StartBounce();
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                },
                /*Gate.StartBounceMatchingGates:static end.*/

                /*Gate.StopBounceMatchingGates:static start.*/
                StopBounceMatchingGates: function (color) {
if ( TRACE ) { TRACE( "Gate#StopBounceMatchingGates", this ); }

                    var $t;
                    $t = Bridge.getEnumerator(Gate.allGates);
                    try {
                        while ($t.moveNext()) {
                            var gate = $t.Current;
                            if (gate.MatchesColor(color)) {
                                gate.StopBounce();
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                },
                /*Gate.StopBounceMatchingGates:static end.*/


            }
        },
        fields: {
            gateColor: null,
            gateSlots: null,
            GridSlotLayer: null,
            boxSize: null,
            boxPosition: null,
            acceptDirection: null,
            gate: null,
            vfxs: null,
            isBouncing: false,
            autoLowerTween: null,
            offset: 0,
            raiseDuration: 0,
            originalLocalPos: null,
            gateOriginalLocalPos: null,
            gateOriginalLocalRot: null
        },
        props: {
            VfxPosition: {
                get: function () {
if ( TRACE ) { TRACE( "Gate#VfxPosition#get", this ); }

                    return this.vfxs != null && this.vfxs.length > 0 && UnityEngine.Component.op_Inequality(this.vfxs[0], null) ? this.vfxs[0].transform.position.$clone() : this.transform.position.$clone();
                }
            }
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "Gate#init", this ); }

                this.gateColor = new UnityEngine.Color();
                this.GridSlotLayer = new UnityEngine.LayerMask();
                this.boxSize = new UnityEngine.Vector3();
                this.boxPosition = new UnityEngine.Vector3();
                this.acceptDirection = new UnityEngine.Vector3();
                this.originalLocalPos = new UnityEngine.Vector3();
                this.gateOriginalLocalPos = new UnityEngine.Vector3();
                this.gateOriginalLocalRot = new UnityEngine.Quaternion();
                this.gateSlots = new (System.Collections.Generic.List$1(GridSlot)).ctor();
                this.boxSize = new pc.Vec3( 2.0, 1.0, 2.0 );
                this.boxPosition = pc.Vec3.ZERO.clone();
                this.acceptDirection = new pc.Vec3( 0, 0, 1 );
                this.isBouncing = false;
                this.offset = 1.0;
                this.raiseDuration = 0.5;
            }
        },
        methods: {
            /*Gate.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "Gate#Awake", this ); }

                Gate.allGates.add(this);
                this.originalLocalPos = this.transform.localPosition.$clone();
            },
            /*Gate.Awake end.*/

            /*Gate.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "Gate#Start", this ); }

                var $t;
                this.FindNearbySlots();
                $t = Bridge.getEnumerator(this.vfxs);
                try {
                    while ($t.moveNext()) {
                        var vfx = $t.Current;
                        vfx.Stop();
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this.gateOriginalLocalPos = this.gate.localPosition.$clone();
                this.gateOriginalLocalRot = this.gate.localRotation.$clone();
            },
            /*Gate.Start end.*/

            /*Gate.OnDestroy start.*/
            OnDestroy: function () {
if ( TRACE ) { TRACE( "Gate#OnDestroy", this ); }

                Gate.allGates.remove(this);
            },
            /*Gate.OnDestroy end.*/

            /*Gate.MatchesColor start.*/
            MatchesColor: function (color) {
if ( TRACE ) { TRACE( "Gate#MatchesColor", this ); }

                return Math.abs(this.gateColor.r - color.r) <= Gate.ColorMatchTolerance && Math.abs(this.gateColor.g - color.g) <= Gate.ColorMatchTolerance && Math.abs(this.gateColor.b - color.b) <= Gate.ColorMatchTolerance;
            },
            /*Gate.MatchesColor end.*/

            /*Gate.CanAccept start.*/
            CanAccept: function (brick) {
if ( TRACE ) { TRACE( "Gate#CanAccept", this ); }

                var $t;
                if (!this.MatchesColor(brick.brickColor)) {
                    return false;
                }
                $t = Bridge.getEnumerator(brick.GetComponentsInChildren(BrickCell));
                try {
                    while ($t.moveNext()) {
                        var cell = $t.Current;
                        var slot = BoardManager.Instance.GetClosestSlot(cell.transform.position);
                        if (UnityEngine.MonoBehaviour.op_Equality(slot, null)) {
                            return false;
                        }
                        if (!this.gateSlots.contains(slot)) {
                            return false;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                if (brick.IsBlockedInDirection(this.acceptDirection.$clone())) {
                    return false;
                }
                return true;
            },
            /*Gate.CanAccept end.*/

            /*Gate.Absorb start.*/
            Absorb: function (brick) {
if ( TRACE ) { TRACE( "Gate#Absorb", this ); }

                var $t;
                brick.DisablePhysics();
                Gate.StopBounceMatchingGates(this.gateColor);
                this.autoLowerTween != null ? DG.Tweening.TweenExtensions.Kill(this.autoLowerTween) : null;
                $t = Bridge.getEnumerator(this.vfxs);
                try {
                    while ($t.moveNext()) {
                        var vfx = $t.Current;
                        vfx.Play();
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                AudioManager.Instance.PlaySFX("Crumple");
                var target = this.vfxs[0].transform;
                DG.Tweening.ShortcutExtensions.DOKill(brick.transform);
                var suckSeq = DG.Tweening.DOTween.Sequence();
                DG.Tweening.TweenSettingsExtensions.Join(suckSeq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOMove(brick.transform, target.position.$clone(), 0.35), DG.Tweening.Ease.InQuad));
                DG.Tweening.TweenSettingsExtensions.Join(suckSeq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOScale(brick.transform, 0.1, 0.35), DG.Tweening.Ease.InQuad));
                DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, suckSeq, Bridge.fn.bind(this, function () {
                    brick.gameObject.SetActive(false);
                    //CameraManager.Instance.Shake(0.1f, 0.1f);
                    BoardManager.Instance.CheckAllBricks();
                    this.Lower();
                }));
            },
            /*Gate.Absorb end.*/

            /*Gate.Lower start.*/
            Lower: function () {
if ( TRACE ) { TRACE( "Gate#Lower", this ); }

                DG.Tweening.ShortcutExtensions.DOKill(this.transform);
                this.autoLowerTween != null ? DG.Tweening.TweenExtensions.Kill(this.autoLowerTween) : null;
                var riseOffset = this.offset;
                var seq = DG.Tweening.DOTween.Sequence();
                DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.transform, this.originalLocalPos.y + riseOffset, this.raiseDuration), DG.Tweening.Ease.OutCubic));
                DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.transform, this.originalLocalPos.y - this.offset, this.raiseDuration / 2), DG.Tweening.Ease.InCubic));
                DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.transform, this.originalLocalPos.y, this.raiseDuration), DG.Tweening.Ease.OutCubic));
                DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, seq, Bridge.fn.bind(this, function () {
                    this.gate.localPosition = this.gateOriginalLocalPos.$clone();
                    this.gate.localRotation = this.gateOriginalLocalRot.$clone();
                    this.Invoke("CheckWin", 0.01);
                }));
            },
            /*Gate.Lower end.*/

            /*Gate.StartBounce start.*/
            StartBounce: function () {
if ( TRACE ) { TRACE( "Gate#StartBounce", this ); }

                if (this.isBouncing) {
                    return;
                }
                this.isBouncing = true;
                DG.Tweening.ShortcutExtensions.DOKill(this.transform);
                var riseOffset = this.offset;
                var seq = DG.Tweening.DOTween.Sequence();
                DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.transform, this.originalLocalPos.y + riseOffset, this.raiseDuration), DG.Tweening.Ease.OutCubic));
                DG.Tweening.TweenSettingsExtensions.Append(seq, DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions), DG.Tweening.ShortcutExtensions.DOLocalMoveY(this.transform, this.originalLocalPos.y, this.raiseDuration), DG.Tweening.Ease.InCubic));
                DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Sequence, seq, Bridge.fn.bind(this, function () {
                    this.isBouncing = false;
                    this.gate.localPosition = this.gateOriginalLocalPos.$clone();
                    this.gate.localRotation = this.gateOriginalLocalRot.$clone();
                }));
            },
            /*Gate.StartBounce end.*/

            /*Gate.StopBounce start.*/
            StopBounce: function () {
if ( TRACE ) { TRACE( "Gate#StopBounce", this ); }

                DG.Tweening.ShortcutExtensions.DOKill(this.transform);
                this.isBouncing = false;
                this.gate.localPosition = this.gateOriginalLocalPos.$clone();
                this.gate.localRotation = this.gateOriginalLocalRot.$clone();
            },
            /*Gate.StopBounce end.*/

            /*Gate.FindNearbySlots start.*/
            FindNearbySlots: function () {
if ( TRACE ) { TRACE( "Gate#FindNearbySlots", this ); }

                var $t;
                this.gateSlots.clear();
                var hits = UnityEngine.Physics.OverlapBox$1(this.transform.TransformPoint$1(this.boxPosition), this.boxSize.$clone().clone().scale( 0.5 ), this.transform.rotation, UnityEngine.LayerMask.op_Implicit(this.GridSlotLayer.$clone()));
                $t = Bridge.getEnumerator(hits);
                try {
                    while ($t.moveNext()) {
                        var hit = $t.Current;
                        var slot = hit.GetComponent(GridSlot);
                        if (UnityEngine.MonoBehaviour.op_Inequality(slot, null)) {
                            this.gateSlots.add(slot);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*Gate.FindNearbySlots end.*/

            /*Gate.CheckWin start.*/
            CheckWin: function () {
if ( TRACE ) { TRACE( "Gate#CheckWin", this ); }

                BoardManager.Instance.CheckAllBricks();
            },
            /*Gate.CheckWin end.*/


        }
    });
    /*Gate end.*/

    /*GridSlot start.*/
    Bridge.define("GridSlot", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            occupyingBrick: null,
            brickLayer: null,
            checkBoxSize: null
        },
        props: {
            IsOccupied: {
                get: function () {
if ( TRACE ) { TRACE( "GridSlot#IsOccupied#get", this ); }

                    return UnityEngine.MonoBehaviour.op_Inequality(this.occupyingBrick, null);
                }
            },
            WorldPosition: {
                get: function () {
if ( TRACE ) { TRACE( "GridSlot#WorldPosition#get", this ); }

                    return this.transform.position.$clone();
                }
            }
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "GridSlot#init", this ); }

                this.brickLayer = new UnityEngine.LayerMask();
                this.checkBoxSize = new UnityEngine.Vector3();
                this.checkBoxSize = new pc.Vec3( 0.9, 0.5, 0.9 );
            }
        },
        methods: {
            /*GridSlot.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "GridSlot#Start", this ); }

                this.DetectInitialBrick();
            },
            /*GridSlot.Start end.*/

            /*GridSlot.DetectInitialBrick start.*/
            DetectInitialBrick: function () {
if ( TRACE ) { TRACE( "GridSlot#DetectInitialBrick", this ); }

                var hits = UnityEngine.Physics.OverlapBox$1(this.transform.position, this.checkBoxSize.$clone().clone().scale( 0.5 ), pc.Quat.IDENTITY.clone(), UnityEngine.LayerMask.op_Implicit(this.brickLayer.$clone()), UnityEngine.QueryTriggerInteraction.Ignore);
                for (var i = 0; i < hits.length; i = (i + 1) | 0) {
                    var cell = hits[i].GetComponent(BrickCell);
                    if (UnityEngine.MonoBehaviour.op_Inequality(cell, null)) {
                        var brick = cell.GetComponentInParent(Brick);
                        if (UnityEngine.MonoBehaviour.op_Inequality(brick, null)) {
                            this.occupyingBrick = brick;
                            brick.RegisterInitialSlot(this);
                            return;
                        }
                    }
                }
            },
            /*GridSlot.DetectInitialBrick end.*/

            /*GridSlot.SetOccupying start.*/
            SetOccupying: function (brick) {
if ( TRACE ) { TRACE( "GridSlot#SetOccupying", this ); }

                this.occupyingBrick = brick;
            },
            /*GridSlot.SetOccupying end.*/

            /*GridSlot.Clear start.*/
            Clear: function () {
if ( TRACE ) { TRACE( "GridSlot#Clear", this ); }

                this.occupyingBrick = null;
            },
            /*GridSlot.Clear end.*/


        }
    });
    /*GridSlot end.*/

    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty start.*/
    Bridge.define("IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty", {
        inherits: [UnityEngine.MonoBehaviour]
    });
    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty end.*/

    /*IterationVariantManagers start.*/
    Bridge.define("IterationVariantManagers", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                FourClickLimit: 0,
                ThirtySecondLimit: 0,
                Instance: null
            },
            ctors: {
                init: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#init", this ); }

                    this.FourClickLimit = 4;
                    this.ThirtySecondLimit = 30.0;
                }
            }
        },
        fields: {
            ActiveIterationType: 0,
            clickTexts: null,
            timerTexts: null,
            ActiveVariantType: 0,
            variants: null,
            endCards: null,
            endCardAnimationDuration: 0,
            scoreTarget: 0,
            isApplied: false,
            isRunning: false,
            isClickLimited: false,
            isTimeLimited: false,
            redirectsBeforeEndCard: false,
            isEndCardShown: false,
            targetClicks: 0,
            currentClicks: 0,
            timeLeft: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#init", this ); }

                this.endCardAnimationDuration = 1.0;
                this.scoreTarget = 14;
            }
        },
        methods: {
            /*IterationVariantManagers.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#Awake", this ); }

                var $t;
                IterationVariantManagers.Instance = this;
                this.isEndCardShown = false;
                $t = Bridge.getEnumerator(this.endCards);
                try {
                    while ($t.moveNext()) {
                        var card = $t.Current;
                        card.alpha = 0.0;
                        card.gameObject.SetActive(false);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*IterationVariantManagers.Awake end.*/

            /*IterationVariantManagers.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#Start", this ); }

                AudioManager.Instance.SetMusicVolume(0.25);
                this.ApplyIterationAndVariantMode();
            },
            /*IterationVariantManagers.Start end.*/

            /*IterationVariantManagers.SetupVariant start.*/
            SetupVariant: function (index) {
if ( TRACE ) { TRACE( "IterationVariantManagers#SetupVariant", this ); }

                for (var i = 0; i < this.variants.length; i = (i + 1) | 0) {
                    if (i === index) {
                        this.variants[i].SetActive(true);
                    } else {
                        this.variants[i].SetActive(false);
                    }
                }
            },
            /*IterationVariantManagers.SetupVariant end.*/

            /*IterationVariantManagers.ApplyIterationAndVariantMode start.*/
            ApplyIterationAndVariantMode: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#ApplyIterationAndVariantMode", this ); }

                if (this.isApplied) {
                    return;
                }
                switch (this.ActiveVariantType) {
                    case IterationVariantManagers.VariantType.Var0: 
                        this.SetupVariant(0);
                        break;
                }
                switch (this.ActiveIterationType) {
                    case IterationVariantManagers.IterationType.FourClicks: 
                        this.ConfigureClickLimit(IterationVariantManagers.FourClickLimit, true);
                        break;
                    case IterationVariantManagers.IterationType.ThirtySeconds: 
                        this.ConfigureTimeLimit(IterationVariantManagers.ThirtySecondLimit, true);
                        break;
                    case IterationVariantManagers.IterationType.Full: 
                        this.ConfigureFull();
                        break;
                    default: 
                        this.ConfigureFull();
                        break;
                }
                ScoreManager.Instance.Initialize(this.scoreTarget);
                this.isApplied = true;
            },
            /*IterationVariantManagers.ApplyIterationAndVariantMode end.*/

            /*IterationVariantManagers.StartIteration start.*/
            StartIteration: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#StartIteration", this ); }

                this.ApplyIterationAndVariantMode();
                if (this.isEndCardShown) {
                    return;
                }
                this.isRunning = true;
            },
            /*IterationVariantManagers.StartIteration end.*/

            /*IterationVariantManagers.RegisterClick start.*/
            RegisterClick: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#RegisterClick", this ); }

                if (!this.isRunning || this.isEndCardShown || !this.isClickLimited) {
                    return;
                }

                this.currentClicks = (this.currentClicks + 1) | 0;
                this.UpdateClickTexts(UnityEngine.Mathf.Max(0, ((this.targetClicks - this.currentClicks) | 0)));

                if (this.currentClicks >= this.targetClicks) {
                    this.ShowEndCard(false);
                }
            },
            /*IterationVariantManagers.RegisterClick end.*/

            /*IterationVariantManagers.ShowEndCard start.*/
            ShowEndCard: function (isWin) {
if ( TRACE ) { TRACE( "IterationVariantManagers#ShowEndCard", this ); }

                var $t;
                if (isWin === void 0) { isWin = false; }
                if (this.isEndCardShown) {
                    return;
                }
                this.isEndCardShown = true;
                this.isRunning = false;

                if (isWin && !ControlManager.Instance.IsGameLocked) {
                    AudioManager.Instance.PlaySFX("Success");
                }
                ControlManager.Instance.IsGameLocked = true;
                ControlManager.Instance.ForceRelease();
                AudioManager.Instance.SetMusicVolume(0.1);
                Luna.Unity.Analytics.LogEvent$1("score_achieved", ScoreManager.Instance.GetScore());
                Luna.Unity.Analytics.LogEvent(isWin ? Luna.Unity.Analytics.EventType.LevelWon : Luna.Unity.Analytics.EventType.LevelFailed);
                Luna.Unity.Analytics.LogEvent(Luna.Unity.Analytics.EventType.EndCardShown);
                if (this.redirectsBeforeEndCard) {
                    CTAManager.Instance.CTAClick();
                }

                $t = Bridge.getEnumerator(this.endCards);
                try {
                    while ($t.moveNext()) {
                        var card = { v : $t.Current };
                        card.v.gameObject.SetActive(true);
                        DG.Tweening.TweenSettingsExtensions.OnComplete(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), DG.Tweening.DOTweenModuleUI.DOFade(card.v, 1.0, this.endCardAnimationDuration), DG.Tweening.Ease.OutQuad), (function ($me, card) {
                            return function () {
                                card.v.interactable = true;
                                card.v.blocksRaycasts = true;
                            };
                        })(this, card));
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                DG.Tweening.DOVirtual.DelayedCall(this.endCardAnimationDuration, function () {
                    CTAManager.Instance.EnableCTA();
                });
            },
            /*IterationVariantManagers.ShowEndCard end.*/

            /*IterationVariantManagers.CanShowEndCardOnLastBricks start.*/
            CanShowEndCardOnLastBricks: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#CanShowEndCardOnLastBricks", this ); }

                return this.ActiveIterationType !== IterationVariantManagers.IterationType.Full;
            },
            /*IterationVariantManagers.CanShowEndCardOnLastBricks end.*/

            /*IterationVariantManagers.Update start.*/
            Update: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#Update", this ); }

                if (!this.isRunning || this.isEndCardShown || !this.isTimeLimited) {
                    return;
                }

                this.timeLeft -= UnityEngine.Time.deltaTime;
                this.UpdateTimerTexts(Math.ceil(UnityEngine.Mathf.Max(0.0, this.timeLeft)));

                if (this.timeLeft <= 0.0) {
                    this.ShowEndCard(false);
                }
            },
            /*IterationVariantManagers.Update end.*/

            /*IterationVariantManagers.ConfigureClickLimit start.*/
            ConfigureClickLimit: function (clicks, autoRedirect) {
if ( TRACE ) { TRACE( "IterationVariantManagers#ConfigureClickLimit", this ); }

                this.isClickLimited = true;
                this.isTimeLimited = false;
                this.redirectsBeforeEndCard = autoRedirect;
                this.targetClicks = clicks;
                this.currentClicks = 0;
                this.timeLeft = 0.0;
                this.UpdateClickTexts(this.targetClicks);
                this.UpdateTimerTexts$1("");
            },
            /*IterationVariantManagers.ConfigureClickLimit end.*/

            /*IterationVariantManagers.ConfigureTimeLimit start.*/
            ConfigureTimeLimit: function (seconds, autoRedirect) {
if ( TRACE ) { TRACE( "IterationVariantManagers#ConfigureTimeLimit", this ); }

                this.isClickLimited = false;
                this.isTimeLimited = true;
                this.redirectsBeforeEndCard = autoRedirect;
                this.targetClicks = 0;
                this.currentClicks = 0;
                this.timeLeft = seconds;
                this.UpdateClickTexts$1("");
                this.UpdateTimerTexts(Math.ceil(this.timeLeft));
            },
            /*IterationVariantManagers.ConfigureTimeLimit end.*/

            /*IterationVariantManagers.ConfigureFull start.*/
            ConfigureFull: function () {
if ( TRACE ) { TRACE( "IterationVariantManagers#ConfigureFull", this ); }

                this.isClickLimited = false;
                this.isTimeLimited = false;
                this.redirectsBeforeEndCard = false;
                this.targetClicks = 0;
                this.currentClicks = 0;
                this.timeLeft = 0.0;
                this.UpdateClickTexts$1("");
                this.UpdateTimerTexts$1("");
            },
            /*IterationVariantManagers.ConfigureFull end.*/

            /*IterationVariantManagers.UpdateClickTexts start.*/
            UpdateClickTexts: function (value) {
if ( TRACE ) { TRACE( "IterationVariantManagers#UpdateClickTexts", this ); }

                this.UpdateClickTexts$1(Bridge.toString(value));
            },
            /*IterationVariantManagers.UpdateClickTexts end.*/

            /*IterationVariantManagers.UpdateClickTexts$1 start.*/
            UpdateClickTexts$1: function (value) {
if ( TRACE ) { TRACE( "IterationVariantManagers#UpdateClickTexts$1", this ); }

                var $t;
                if (this.clickTexts == null) {
                    return;
                }
                $t = Bridge.getEnumerator(this.clickTexts);
                try {
                    while ($t.moveNext()) {
                        var text = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(text, null)) {
                            text.text = value;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*IterationVariantManagers.UpdateClickTexts$1 end.*/

            /*IterationVariantManagers.UpdateTimerTexts start.*/
            UpdateTimerTexts: function (value) {
if ( TRACE ) { TRACE( "IterationVariantManagers#UpdateTimerTexts", this ); }

                this.UpdateTimerTexts$1(Bridge.toString(value));
            },
            /*IterationVariantManagers.UpdateTimerTexts end.*/

            /*IterationVariantManagers.UpdateTimerTexts$1 start.*/
            UpdateTimerTexts$1: function (value) {
if ( TRACE ) { TRACE( "IterationVariantManagers#UpdateTimerTexts$1", this ); }

                var $t;
                if (this.timerTexts == null) {
                    return;
                }
                $t = Bridge.getEnumerator(this.timerTexts);
                try {
                    while ($t.moveNext()) {
                        var text = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(text, null)) {
                            text.text = value;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*IterationVariantManagers.UpdateTimerTexts$1 end.*/


        },
        overloads: {
            "UpdateClickTexts(string)": "UpdateClickTexts$1",
            "UpdateTimerTexts(string)": "UpdateTimerTexts$1"
        }
    });
    /*IterationVariantManagers end.*/

    /*IterationVariantManagers+IterationType start.*/
    Bridge.define("IterationVariantManagers.IterationType", {
        $kind: 1006,
        statics: {
            fields: {
                FourClicks: 0,
                ThirtySeconds: 1,
                Full: 2
            }
        }
    });
    /*IterationVariantManagers+IterationType end.*/

    /*IterationVariantManagers+VariantType start.*/
    Bridge.define("IterationVariantManagers.VariantType", {
        $kind: 1006,
        statics: {
            fields: {
                Var0: 0
            }
        }
    });
    /*IterationVariantManagers+VariantType end.*/

    /*PanAxis start.*/
    Bridge.define("PanAxis", {
        $kind: 6,
        statics: {
            fields: {
                XY: 0,
                XZ: 1,
                YZ: 2
            }
        }
    });
    /*PanAxis end.*/

    /*ReadOnlyAttribute start.*/
    Bridge.define("ReadOnlyAttribute", {
        inherits: [UnityEngine.PropertyAttribute]
    });
    /*ReadOnlyAttribute end.*/

    /*ScoreManager start.*/
    Bridge.define("ScoreManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            fillBar: null,
            fillImage: null,
            scoreTexts: null,
            startingFillPercent: 0,
            totalScore: 0,
            score: 0
        },
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "ScoreManager#init", this ); }

                this.startingFillPercent = 0.0;
                this.totalScore = 0;
                this.score = 0;
            }
        },
        methods: {
            /*ScoreManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "ScoreManager#Awake", this ); }

                ScoreManager.Instance = this;
                this.score = 0;
            },
            /*ScoreManager.Awake end.*/

            /*ScoreManager.UpdateUIImmediate start.*/
            UpdateUIImmediate: function () {
if ( TRACE ) { TRACE( "ScoreManager#UpdateUIImmediate", this ); }

                var $t;
                $t = Bridge.getEnumerator(this.scoreTexts);
                try {
                    while ($t.moveNext()) {
                        var scoreText = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(scoreText, null)) {
                            scoreText.text = Bridge.toString(this.score);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.fillImage, null)) {
                    var normalizedScore = this.score / this.totalScore;
                    var percent = this.startingFillPercent + (normalizedScore * (1.0 - this.startingFillPercent));
                    this.fillImage.fillAmount = percent;
                }
            },
            /*ScoreManager.UpdateUIImmediate end.*/

            /*ScoreManager.Initialize start.*/
            Initialize: function (TotalScore) {
if ( TRACE ) { TRACE( "ScoreManager#Initialize", this ); }

                this.totalScore = TotalScore;
                this.UpdateUIImmediate();
            },
            /*ScoreManager.Initialize end.*/

            /*ScoreManager.AddScore start.*/
            AddScore: function (amount) {
if ( TRACE ) { TRACE( "ScoreManager#AddScore", this ); }

                var $t;
                var previousScore = this.score;
                this.score = (this.score + amount) | 0;
                if (this.score < 0) {
                    this.score = 0;
                }
                if (this.score >= this.totalScore) {
                    this.score = this.totalScore;
                }
                if (amount <= 0) {
                    return;
                }

                var duration = 0.4;
                DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(System.Int32,System.Int32,DG.Tweening.Plugins.Options.NoOptions), DG.Tweening.DOTween.To$2(function () {
                    return previousScore;
                }, Bridge.fn.bind(this, function (x) {
                    var $t;
                    previousScore = x;

                    $t = Bridge.getEnumerator(this.scoreTexts);
                    try {
                        while ($t.moveNext()) {
                            var scoreText = $t.Current;
                            if (UnityEngine.MonoBehaviour.op_Inequality(scoreText, null)) {
                                scoreText.text = Bridge.toString(x);
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                }), this.score, duration), DG.Tweening.Ease.OutCubic);

                $t = Bridge.getEnumerator(this.scoreTexts);
                try {
                    while ($t.moveNext()) {
                        var scoreText = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Equality(scoreText, null)) {
                            continue;
                        }

                        DG.Tweening.ShortcutExtensions.DOKill(scoreText.transform$1);
                        scoreText.transform$1.localScale = new pc.Vec3( 1, 1, 1 );
                        DG.Tweening.ShortcutExtensions.DOPunchScale(scoreText.transform$1, new pc.Vec3( 1, 1, 1 ).clone().scale( 0.3 ), 0.3, 10, 1);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.fillBar, null)) {
                    DG.Tweening.ShortcutExtensions.DOKill(this.fillBar.transform);
                    var originalScale = this.fillBar.transform.localScale.$clone();
                    this.fillBar.transform.localScale = originalScale.$clone();
                    DG.Tweening.ShortcutExtensions.DOPunchScale(this.fillBar.transform, originalScale.$clone().clone().scale( 0.2 ), 0.3, 10, 1);
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.fillImage, null)) {
                    var normalizedScore = this.score / this.totalScore;
                    var targetPercent = this.startingFillPercent + (normalizedScore * (1.0 - this.startingFillPercent));

                    DG.Tweening.ShortcutExtensions.DOKill(this.fillImage);
                    DG.Tweening.TweenSettingsExtensions.SetEase$2(DG.Tweening.Core.TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions), DG.Tweening.DOTweenModuleUI.DOFillAmount(this.fillImage, targetPercent, duration), DG.Tweening.Ease.OutCubic);
                }
            },
            /*ScoreManager.AddScore end.*/

            /*ScoreManager.GetScore start.*/
            GetScore: function () {
if ( TRACE ) { TRACE( "ScoreManager#GetScore", this ); }

                return this.score;
            },
            /*ScoreManager.GetScore end.*/


        }
    });
    /*ScoreManager end.*/

    /*AudioManager start.*/
    Bridge.define("AudioManager", {
        inherits: [UnityEngine.MonoBehaviour,Core.Services.IAudioService],
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            library: null,
            sfxPoolSize: 0,
            sfxPool: null,
            musicSource: null,
            musicVolume: 0,
            sfxVolume: 0,
            _canPlaySounds: false
        },
        alias: [
            "PlaySFX", "Core$Services$IAudioService$PlaySFX",
            "PlayMusic", "Core$Services$IAudioService$PlayMusic",
            "StopMusic", "Core$Services$IAudioService$StopMusic",
            "SetMusicVolume", "Core$Services$IAudioService$SetMusicVolume",
            "SetSFXVolume", "Core$Services$IAudioService$SetSFXVolume"
        ],
        ctors: {
            init: function () {
if ( TRACE ) { TRACE( "AudioManager#init", this ); }

                this.sfxPoolSize = 10;
                this.sfxPool = new (System.Collections.Generic.Queue$1(UnityEngine.AudioSource)).ctor();
                this.musicVolume = 0.25;
                this.sfxVolume = 1.0;
                this._canPlaySounds = true;
            }
        },
        methods: {
            /*AudioManager.Awake start.*/
            Awake: function () {
if ( TRACE ) { TRACE( "AudioManager#Awake", this ); }

                if (UnityEngine.MonoBehaviour.op_Inequality(AudioManager.Instance, null) && UnityEngine.MonoBehaviour.op_Inequality(AudioManager.Instance, this)) {
                    UnityEngine.MonoBehaviour.Destroy(this.gameObject);
                    return;
                }
                AudioManager.Instance = this;
                UnityEngine.Object.DontDestroyOnLoad(this.gameObject);

                // Create SFX sources
                for (var i = 0; i < this.sfxPoolSize; i = (i + 1) | 0) {
                    var go = new UnityEngine.GameObject.$ctor2(System.String.format("SFX_Source_{0}", [Bridge.box(i, System.Int32)]));
                    go.transform.parent = this.transform;
                    var src = go.AddComponent(UnityEngine.AudioSource);
                    src.playOnAwake = false;
                    src.loop = false;
                    src.volume = this.sfxVolume;
                    this.sfxPool.Enqueue(src);
                }

                // Create Music source
                var musicGo = new UnityEngine.GameObject.$ctor2("Music_Source");
                musicGo.transform.parent = this.transform;
                this.musicSource = musicGo.AddComponent(UnityEngine.AudioSource);
                this.musicSource.playOnAwake = false;
                this.musicSource.loop = true;
                this.musicSource.volume = this.musicVolume;

                this.library.Initialize();

                Core.Services.ServicesLocator.Register(Core.Services.IAudioService, this);
            },
            /*AudioManager.Awake end.*/

            /*AudioManager.Start start.*/
            Start: function () {
if ( TRACE ) { TRACE( "AudioManager#Start", this ); }

                this.StartCoroutine$1(this.WaitOnTap());
            },
            /*AudioManager.Start end.*/

            /*AudioManager.WaitOnTap start.*/
            WaitOnTap: function () {
if ( TRACE ) { TRACE( "AudioManager#WaitOnTap", this ); }

                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    $enumerator.current = new UnityEngine.WaitUntil(function () {
                                            return (UnityEngine.Input.GetMouseButtonDown(0) || UnityEngine.Input.touchCount > 0);
                                        });
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    this._canPlaySounds = true;

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*AudioManager.WaitOnTap end.*/

            /*AudioManager.OnDisable start.*/
            OnDisable: function () {
if ( TRACE ) { TRACE( "AudioManager#OnDisable", this ); }

                Core.Services.ServicesLocator.Unregister(Core.Services.IAudioService);
            },
            /*AudioManager.OnDisable end.*/

            /*AudioManager.PlaySFX start.*/
            PlaySFX: function (key, position, pitch) {
if ( TRACE ) { TRACE( "AudioManager#PlaySFX", this ); }

                if (position === void 0) { position = null; }
                if (pitch === void 0) { pitch = 1.0; }
                if (!this._canPlaySounds) {
                    return;
                } // Prevent playing sounds before user interaction (mobile autoplay policy)
                var entry = { v : new AudioLibrary.ClipEntry() };

                if (!this.library.TryGetClip(key, entry) || entry.v.channel !== AudioChannel.SFX) {
                    return;
                }

                if (this.sfxPool.Count === 0) {
                    return;
                } // Avoid overflow

                var src = this.sfxPool.Dequeue();
                src.clip = entry.v.clip;
                src.volume = this.sfxVolume * entry.v.volume;
                src.pitch = pitch;

                src.Play();

                this.StartCoroutine$1(this.ReturnToPoolWhenDone(src));
            },
            /*AudioManager.PlaySFX end.*/

            /*AudioManager.PlayMusic start.*/
            PlayMusic: function (key, fadeDuration) {
if ( TRACE ) { TRACE( "AudioManager#PlayMusic", this ); }

                if (fadeDuration === void 0) { fadeDuration = 0.5; }
                if (!this._canPlaySounds) {
                    return;
                } // Prevent playing sounds before user interaction (mobile autoplay policy)
                var entry = { v : new AudioLibrary.ClipEntry() };

                if (!this.library.TryGetClip(key, entry) || entry.v.channel !== AudioChannel.Music) {
                    return;
                }

                if (this.musicSource.isPlaying && Bridge.referenceEquals(this.musicSource.clip, entry.v.clip)) {
                    return;
                }

                this.StopCoroutine$1("CrossfadeMusic");
                this.StartCoroutine$1(this.CrossfadeMusic(entry.v.clip, entry.v.volume, entry.v.loop, fadeDuration));
            },
            /*AudioManager.PlayMusic end.*/

            /*AudioManager.StopMusic$1 start.*/
            StopMusic$1: function () {
if ( TRACE ) { TRACE( "AudioManager#StopMusic$1", this ); }

                this.musicSource.Stop();
            },
            /*AudioManager.StopMusic$1 end.*/

            /*AudioManager.StopMusic start.*/
            StopMusic: function (fadeDuration) {
if ( TRACE ) { TRACE( "AudioManager#StopMusic", this ); }

                if (fadeDuration === void 0) { fadeDuration = 1.0; }

            },
            /*AudioManager.StopMusic end.*/

            /*AudioManager.SetMusicVolume start.*/
            SetMusicVolume: function (volume) {
if ( TRACE ) { TRACE( "AudioManager#SetMusicVolume", this ); }

                this.musicVolume = Math.max(0, Math.min(1, volume));
                this.musicSource.volume = this.musicVolume;
            },
            /*AudioManager.SetMusicVolume end.*/

            /*AudioManager.SetSFXVolume start.*/
            SetSFXVolume: function (volume) {
if ( TRACE ) { TRACE( "AudioManager#SetSFXVolume", this ); }

                this.sfxVolume = Math.max(0, Math.min(1, volume));
            },
            /*AudioManager.SetSFXVolume end.*/

            /*AudioManager.ReturnToPoolWhenDone start.*/
            ReturnToPoolWhenDone: function (src) {
if ( TRACE ) { TRACE( "AudioManager#ReturnToPoolWhenDone", this ); }

                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    $enumerator.current = new UnityEngine.WaitWhile(function () {
                                            return src.isPlaying;
                                        });
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    this.sfxPool.Enqueue(src);

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*AudioManager.ReturnToPoolWhenDone end.*/

            /*AudioManager.CrossfadeMusic start.*/
            CrossfadeMusic: function (newClip, targetVolume, loop, duration) {
if ( TRACE ) { TRACE( "AudioManager#CrossfadeMusic", this ); }

                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    startVolume,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    startVolume = this.musicSource.volume;
                                        t = 0.0;

                                        // Fade out
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( t < duration ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    t += UnityEngine.Time.deltaTime;
                                        this.musicSource.volume = pc.math.lerp(startVolume, 0.0, t / duration);
                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    this.musicSource.Stop();
                                        this.musicSource.clip = newClip;
                                        this.musicSource.loop = loop;
                                        this.musicSource.Play();

                                        // Fade in
                                        t = 0.0;
                                    $step = 5;
                                    continue;
                                }
                                case 5: {
                                    if ( t < duration ) {
                                            $step = 6;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 6: {
                                    t += UnityEngine.Time.deltaTime;
                                        this.musicSource.volume = pc.math.lerp(0.0, targetVolume, t / duration);
                                        $enumerator.current = null;
                                        $step = 7;
                                        return true;
                                }
                                case 7: {
                                    
                                        $step = 5;
                                        continue;
                                }
                                case 8: {
                                    this.musicSource.volume = targetVolume;

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*AudioManager.CrossfadeMusic end.*/


        },
        overloads: {
            "StopMusic()": "StopMusic$1"
        }
    });
    /*AudioManager end.*/

    if ( MODULE_reflection ) {
    var $m = Bridge.setMetadata,
        $n = ["System","System.Collections.Generic","UnityEngine","System.Collections","DG.Tweening","UnityEngine.UI","UnityEngine.Audio","DG.Tweening.Core","DG.Tweening.Plugins.Core.PathCore","System.Globalization","DG.Tweening.Plugins.Options"];

    /*AudioChannel start.*/
    $m("AudioChannel", function () { return {"att":257,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Music","is":true,"t":4,"rt":AudioChannel,"sn":"Music","box":function ($v) { return Bridge.box($v, AudioChannel, System.Enum.toStringFn(AudioChannel));}},{"a":2,"n":"SFX","is":true,"t":4,"rt":AudioChannel,"sn":"SFX","box":function ($v) { return Bridge.box($v, AudioChannel, System.Enum.toStringFn(AudioChannel));}}]}; }, $n);
    /*AudioChannel end.*/

    /*AudioLibrary start.*/
    $m("AudioLibrary", function () { return {"nested":[AudioLibrary.ClipEntry],"att":1048577,"a":2,"at":[Bridge.apply(new UnityEngine.CreateAssetMenuAttribute(), {
        menuName: "Audio/Audio Library", fileName: "AudioLibrary"
    } )],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Initialize","t":8,"sn":"Initialize","rt":$n[0].Void},{"a":2,"n":"TryGetClip","t":8,"pi":[{"n":"key","pt":$n[0].String,"ps":0},{"n":"entry","out":true,"pt":AudioLibrary.ClipEntry,"ps":1}],"sn":"TryGetClip","rt":$n[0].Boolean,"p":[$n[0].String,AudioLibrary.ClipEntry],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"clips","t":4,"rt":$n[1].List$1(AudioLibrary.ClipEntry),"sn":"clips"},{"a":1,"n":"lookup","t":4,"rt":$n[1].Dictionary$2(System.String,AudioLibrary.ClipEntry),"sn":"lookup"}]}; }, $n);
    /*AudioLibrary end.*/

    /*AudioLibrary+ClipEntry start.*/
    $m("AudioLibrary.ClipEntry", function () { return {"td":AudioLibrary,"att":1057034,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"channel","t":4,"rt":AudioChannel,"sn":"channel","box":function ($v) { return Bridge.box($v, AudioChannel, System.Enum.toStringFn(AudioChannel));}},{"a":2,"n":"clip","t":4,"rt":$n[2].AudioClip,"sn":"clip"},{"a":2,"n":"key","t":4,"rt":$n[0].String,"sn":"key"},{"a":2,"n":"loop","t":4,"rt":$n[0].Boolean,"sn":"loop","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"volume","t":4,"rt":$n[0].Single,"sn":"volume","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*AudioLibrary+ClipEntry end.*/

    /*AudioManager start.*/
    $m("AudioManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CrossfadeMusic","t":8,"pi":[{"n":"newClip","pt":$n[2].AudioClip,"ps":0},{"n":"targetVolume","pt":$n[0].Single,"ps":1},{"n":"loop","pt":$n[0].Boolean,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"CrossfadeMusic","rt":$n[3].IEnumerator,"p":[$n[2].AudioClip,$n[0].Single,$n[0].Boolean,$n[0].Single]},{"a":1,"n":"OnDisable","t":8,"sn":"OnDisable","rt":$n[0].Void},{"a":2,"n":"PlayMusic","t":8,"pi":[{"n":"key","pt":$n[0].String,"ps":0},{"n":"fadeDuration","dv":0.5,"o":true,"pt":$n[0].Single,"ps":1}],"sn":"PlayMusic","rt":$n[0].Void,"p":[$n[0].String,$n[0].Single]},{"a":2,"n":"PlaySFX","t":8,"pi":[{"n":"key","pt":$n[0].String,"ps":0},{"n":"position","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Vector3),"ps":1},{"n":"pitch","dv":1.0,"o":true,"pt":$n[0].Single,"ps":2}],"sn":"PlaySFX","rt":$n[0].Void,"p":[$n[0].String,$n[0].Nullable$1(UnityEngine.Vector3),$n[0].Single]},{"a":1,"n":"ReturnToPoolWhenDone","t":8,"pi":[{"n":"src","pt":$n[2].AudioSource,"ps":0}],"sn":"ReturnToPoolWhenDone","rt":$n[3].IEnumerator,"p":[$n[2].AudioSource]},{"a":2,"n":"SetMusicVolume","t":8,"pi":[{"n":"volume","pt":$n[0].Single,"ps":0}],"sn":"SetMusicVolume","rt":$n[0].Void,"p":[$n[0].Single]},{"a":2,"n":"SetSFXVolume","t":8,"pi":[{"n":"volume","pt":$n[0].Single,"ps":0}],"sn":"SetSFXVolume","rt":$n[0].Void,"p":[$n[0].Single]},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"StopMusic","t":8,"sn":"StopMusic$1","rt":$n[0].Void},{"a":2,"n":"StopMusic","t":8,"pi":[{"n":"fadeDuration","dv":1.0,"o":true,"pt":$n[0].Single,"ps":0}],"sn":"StopMusic","rt":$n[0].Void,"p":[$n[0].Single]},{"a":1,"n":"WaitOnTap","t":8,"sn":"WaitOnTap","rt":$n[3].IEnumerator},{"a":2,"n":"Instance","is":true,"t":16,"rt":AudioManager,"g":{"a":2,"n":"get_Instance","t":8,"rt":AudioManager,"fg":"Instance","is":true},"s":{"a":1,"n":"set_Instance","t":8,"p":[AudioManager],"rt":$n[0].Void,"fs":"Instance","is":true},"fn":"Instance"},{"a":1,"n":"_canPlaySounds","t":4,"rt":$n[0].Boolean,"sn":"_canPlaySounds","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("Library")],"a":2,"n":"library","t":4,"rt":AudioLibrary,"sn":"library"},{"a":1,"n":"musicSource","t":4,"rt":$n[2].AudioSource,"sn":"musicSource"},{"a":1,"n":"musicVolume","t":4,"rt":$n[0].Single,"sn":"musicVolume","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"sfxPool","t":4,"rt":$n[1].Queue$1(UnityEngine.AudioSource),"sn":"sfxPool"},{"at":[new UnityEngine.HeaderAttribute("SFX Pool Settings")],"a":2,"n":"sfxPoolSize","t":4,"rt":$n[0].Int32,"sn":"sfxPoolSize","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"sfxVolume","t":4,"rt":$n[0].Single,"sn":"sfxVolume","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"backing":true,"n":"<Instance>k__BackingField","is":true,"t":4,"rt":AudioManager,"sn":"Instance"}]}; }, $n);
    /*AudioManager end.*/

    /*BoardManager start.*/
    $m("BoardManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"CheckAllBricks","t":8,"sn":"CheckAllBricks","rt":$n[0].Void},{"a":2,"n":"CheckIfLastBricks","t":8,"sn":"CheckIfLastBricks","rt":$n[0].Void},{"a":2,"n":"GetClosestSlot","t":8,"pi":[{"n":"pos","pt":$n[2].Vector3,"ps":0}],"sn":"GetClosestSlot","rt":GridSlot,"p":[$n[2].Vector3]},{"a":2,"n":"GetSlotAtPosition","t":8,"pi":[{"n":"worldPos","pt":$n[2].Vector3,"ps":0}],"sn":"GetSlotAtPosition","rt":GridSlot,"p":[$n[2].Vector3]},{"a":2,"n":"Instance","is":true,"t":4,"rt":BoardManager,"sn":"Instance"},{"at":[new UnityEngine.SerializeFieldAttribute(),new ReadOnlyAttribute()],"a":1,"n":"bricks","t":4,"rt":$n[1].List$1(Brick),"sn":"bricks"},{"at":[new UnityEngine.SerializeFieldAttribute(),new ReadOnlyAttribute()],"a":1,"n":"slots","t":4,"rt":$n[1].List$1(GridSlot),"sn":"slots"}]}; }, $n);
    /*BoardManager end.*/

    /*BrickColor start.*/
    $m("BrickColor", function () { return {"att":257,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Blue","is":true,"t":4,"rt":BrickColor,"sn":"Blue","box":function ($v) { return Bridge.box($v, BrickColor, System.Enum.toStringFn(BrickColor));}},{"a":2,"n":"Green","is":true,"t":4,"rt":BrickColor,"sn":"Green","box":function ($v) { return Bridge.box($v, BrickColor, System.Enum.toStringFn(BrickColor));}},{"a":2,"n":"Red","is":true,"t":4,"rt":BrickColor,"sn":"Red","box":function ($v) { return Bridge.box($v, BrickColor, System.Enum.toStringFn(BrickColor));}},{"a":2,"n":"Yellow","is":true,"t":4,"rt":BrickColor,"sn":"Yellow","box":function ($v) { return Bridge.box($v, BrickColor, System.Enum.toStringFn(BrickColor));}}]}; }, $n);
    /*BrickColor end.*/

    /*Brick start.*/
    $m("Brick", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(UnityEngine.Rigidbody)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CaptureReleasedSlots","t":8,"sn":"CaptureReleasedSlots","rt":$n[0].Void},{"a":1,"n":"CheckForGateWhileDragging","t":8,"sn":"CheckForGateWhileDragging","rt":$n[0].Void},{"a":1,"n":"ClearSlots","t":8,"sn":"ClearSlots","rt":$n[0].Void},{"a":2,"n":"DisablePhysics","t":8,"sn":"DisablePhysics","rt":$n[0].Void},{"a":2,"n":"Drag","t":8,"sn":"Drag","rt":$n[0].Void},{"a":1,"n":"Dragging","t":8,"sn":"Dragging","rt":$n[0].Void},{"a":2,"n":"Drop","t":8,"sn":"Drop","rt":$n[0].Void},{"a":1,"n":"FixedUpdate","t":8,"sn":"FixedUpdate","rt":$n[0].Void},{"a":1,"n":"GetMouseWorld","t":8,"sn":"GetMouseWorld","rt":$n[2].Vector3},{"a":2,"n":"GetOccupiedSlots","t":8,"sn":"GetOccupiedSlots","rt":$n[1].List$1(GridSlot)},{"a":1,"n":"IsBlocked","t":8,"pi":[{"n":"move","pt":$n[2].Vector3,"ps":0}],"sn":"IsBlocked","rt":$n[0].Boolean,"p":[$n[2].Vector3],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsBlockedInDirection","t":8,"pi":[{"n":"direction","pt":$n[2].Vector3,"ps":0}],"sn":"IsBlockedInDirection","rt":$n[0].Boolean,"p":[$n[2].Vector3],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"KillTween","t":8,"sn":"KillTween","rt":$n[0].Void},{"a":1,"n":"RaiseMesh","t":8,"sn":"RaiseMesh","rt":$n[0].Void},{"a":2,"n":"RegisterInitialSlot","t":8,"pi":[{"n":"slot","pt":GridSlot,"ps":0}],"sn":"RegisterInitialSlot","rt":$n[0].Void,"p":[GridSlot]},{"a":1,"n":"ResetMeshPosition","t":8,"sn":"ResetMeshPosition","rt":$n[0].Void},{"a":1,"n":"RestoreReleasedSlots","t":8,"sn":"RestoreReleasedSlots","rt":$n[0].Void},{"a":1,"n":"SetDraggingState","t":8,"pi":[{"n":"dragging","pt":$n[0].Boolean,"ps":0}],"sn":"SetDraggingState","rt":$n[0].Void,"p":[$n[0].Boolean]},{"a":1,"n":"SnapBack","t":8,"sn":"SnapBack","rt":$n[0].Void},{"a":1,"n":"SnapToSlots","t":8,"pi":[{"n":"slots","pt":$n[1].List$1(GridSlot),"ps":0}],"sn":"SnapToSlots","rt":$n[0].Void,"p":[$n[1].List$1(GridSlot)]},{"a":1,"n":"TrySnap","t":8,"sn":"TrySnap","rt":$n[0].Void},{"a":2,"n":"BrickColor","t":4,"rt":BrickColor,"sn":"BrickColor","box":function ($v) { return Bridge.box($v, BrickColor, System.Enum.toStringFn(BrickColor));}},{"a":1,"n":"activeTween","t":4,"rt":$n[4].Tween,"sn":"activeTween"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"blockCheckCells","t":4,"rt":$n[0].Int32,"sn":"blockCheckCells","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("Movement"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"blockingLayers","t":4,"rt":$n[2].LayerMask,"sn":"blockingLayers"},{"a":2,"n":"brickColor","t":4,"rt":$n[2].Color,"sn":"brickColor"},{"at":[new UnityEngine.HeaderAttribute("Visual"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"brickMesh","t":4,"rt":$n[2].MeshRenderer,"sn":"brickMesh"},{"a":1,"n":"cam","t":4,"rt":$n[2].Camera,"sn":"cam"},{"a":1,"n":"cells","t":4,"rt":System.Array.type(BrickCell),"sn":"cells"},{"a":1,"n":"dragOffset","t":4,"rt":$n[2].Vector3,"sn":"dragOffset"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"followSpeed","t":4,"rt":$n[0].Single,"sn":"followSpeed","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"gateBlockingLayers","t":4,"rt":$n[2].LayerMask,"sn":"gateBlockingLayers"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"highlight","t":4,"rt":$n[2].GameObject,"sn":"highlight"},{"a":1,"n":"isAccepted","t":4,"rt":$n[0].Boolean,"sn":"isAccepted","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isDragging","t":4,"rt":$n[0].Boolean,"sn":"isDragging","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"liftAmount","t":4,"rt":$n[0].Single,"sn":"liftAmount","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"liftDuration","t":4,"rt":$n[0].Single,"sn":"liftDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"maxDragStep","t":4,"rt":$n[0].Single,"sn":"maxDragStep","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"meshOriginalLocalPos","t":4,"rt":$n[2].Vector3,"sn":"meshOriginalLocalPos"},{"a":1,"n":"meshTween","t":4,"rt":$n[4].Tween,"sn":"meshTween"},{"a":1,"n":"occupiedSlots","t":4,"rt":$n[1].List$1(GridSlot),"sn":"occupiedSlots"},{"a":1,"n":"originalPosition","t":4,"rt":$n[2].Vector3,"sn":"originalPosition"},{"a":1,"n":"rb","t":4,"rt":$n[2].Rigidbody,"sn":"rb"},{"a":1,"n":"releasedSlots","t":4,"rt":$n[1].List$1(GridSlot),"sn":"releasedSlots","ro":true},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"snapBackDuration","t":4,"rt":$n[0].Single,"sn":"snapBackDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"snapDuration","t":4,"rt":$n[0].Single,"sn":"snapDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*Brick end.*/

    /*BrickCell start.*/
    $m("BrickCell", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(UnityEngine.Collider)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"IsBlocked","t":8,"pi":[{"n":"move","pt":$n[2].Vector3,"ps":0},{"n":"blockingLayers","pt":$n[2].LayerMask,"ps":1},{"n":"root","pt":$n[2].Transform,"ps":2}],"sn":"IsBlocked","rt":$n[0].Boolean,"p":[$n[2].Vector3,$n[2].LayerMask,$n[2].Transform],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsNeighborBlocked","t":8,"pi":[{"n":"step","pt":$n[2].Vector3,"ps":0},{"n":"blockingLayers","pt":$n[2].LayerMask,"ps":1},{"n":"root","pt":$n[2].Transform,"ps":2}],"sn":"IsNeighborBlocked","rt":$n[0].Boolean,"p":[$n[2].Vector3,$n[2].LayerMask,$n[2].Transform],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"col","t":4,"rt":$n[2].Collider,"sn":"col"},{"at":[new UnityEngine.HideInInspector()],"a":2,"n":"localGridPosition","t":4,"rt":$n[2].Vector2Int,"sn":"localGridPosition"}]}; }, $n);
    /*BrickCell end.*/

    /*CameraFitter start.*/
    $m("CameraFitter", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(UnityEngine.Camera)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"ApplyFit","t":8,"sn":"ApplyFit","rt":$n[0].Void},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"at":[new UnityEngine.HeaderAttribute("Reference Setup"),new UnityEngine.TooltipAttribute("The orthographic size the scene was authored at, for the reference aspect below."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"baseOrthoSize","t":4,"rt":$n[0].Single,"sn":"baseOrthoSize","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Landscape"),new UnityEngine.TooltipAttribute("When true, landscape keeps base ortho size (fit by height). When false, landscape also fits by width."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"landscapeFitByHeight","t":4,"rt":$n[0].Boolean,"sn":"landscapeFitByHeight","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"lastScreenHeight","t":4,"rt":$n[0].Int32,"sn":"lastScreenHeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"lastScreenWidth","t":4,"rt":$n[0].Int32,"sn":"lastScreenWidth","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("Maximum orthographic size for phones."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"maxOrthoSize","t":4,"rt":$n[0].Single,"sn":"maxOrthoSize","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Ortho Size Clamp (Phone)"),new UnityEngine.TooltipAttribute("Minimum orthographic size for phones."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"minOrthoSize","t":4,"rt":$n[0].Single,"sn":"minOrthoSize","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Reference Aspects (width / height)"),new UnityEngine.TooltipAttribute("Reference aspect for phones. 0.5625 = 9:16."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"phoneReferenceAspect","t":4,"rt":$n[0].Single,"sn":"phoneReferenceAspect","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("Aspect ratio threshold. Devices with aspect >= this are treated as tablets."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"tabletAspectThreshold","t":4,"rt":$n[0].Single,"sn":"tabletAspectThreshold","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("Maximum orthographic size for tablets."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"tabletMaxOrthoSize","t":4,"rt":$n[0].Single,"sn":"tabletMaxOrthoSize","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Ortho Size Clamp (Tablet)"),new UnityEngine.TooltipAttribute("Minimum orthographic size for tablets."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"tabletMinOrthoSize","t":4,"rt":$n[0].Single,"sn":"tabletMinOrthoSize","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("Reference aspect for tablets. 0.75 = 3:4 (iPad portrait)."),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"tabletReferenceAspect","t":4,"rt":$n[0].Single,"sn":"tabletReferenceAspect","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"targetCamera","t":4,"rt":$n[2].Camera,"sn":"targetCamera"},{"at":[new UnityEngine.HeaderAttribute("UI Elements"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"uiScale","t":4,"rt":System.Array.type(UnityEngine.RectTransform),"sn":"uiScale"}]}; }, $n);
    /*CameraFitter end.*/

    /*AnimationStep start.*/
    $m("AnimationStep", function () { return {"att":1057033,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"duration","t":4,"rt":$n[0].Single,"sn":"duration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"target","t":4,"rt":$n[2].Vector3,"sn":"target"},{"a":2,"n":"zoom","t":4,"rt":$n[0].Single,"sn":"zoom","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*AnimationStep end.*/

    /*AnimationSeqStep start.*/
    $m("AnimationSeqStep", function () { return {"att":1057033,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"duration","t":4,"rt":$n[0].Single,"sn":"duration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"ease","t":4,"rt":$n[4].Ease,"sn":"ease","box":function ($v) { return Bridge.box($v, DG.Tweening.Ease, System.Enum.toStringFn(DG.Tweening.Ease));}},{"a":2,"n":"pause","t":4,"rt":$n[0].Single,"sn":"pause","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"target","t":4,"rt":$n[2].Vector3,"sn":"target"},{"a":2,"n":"zoom","t":4,"rt":$n[0].Single,"sn":"zoom","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*AnimationSeqStep end.*/

    /*PanAxis start.*/
    $m("PanAxis", function () { return {"att":257,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"XY","is":true,"t":4,"rt":PanAxis,"sn":"XY","box":function ($v) { return Bridge.box($v, PanAxis, System.Enum.toStringFn(PanAxis));}},{"a":2,"n":"XZ","is":true,"t":4,"rt":PanAxis,"sn":"XZ","box":function ($v) { return Bridge.box($v, PanAxis, System.Enum.toStringFn(PanAxis));}},{"a":2,"n":"YZ","is":true,"t":4,"rt":PanAxis,"sn":"YZ","box":function ($v) { return Bridge.box($v, PanAxis, System.Enum.toStringFn(PanAxis));}}]}; }, $n);
    /*PanAxis end.*/

    /*CameraManager start.*/
    $m("CameraManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Animate","t":8,"sn":"Animate","rt":$n[0].Void},{"a":2,"n":"AnimateReturn","t":8,"sn":"AnimateReturn","rt":$n[0].Void},{"a":2,"n":"AnimateSeq","t":8,"sn":"AnimateSeq","rt":$n[0].Void},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"DOZoom","t":8,"pi":[{"n":"target","pt":$n[0].Single,"ps":0},{"n":"duration","pt":$n[0].Single,"ps":1},{"n":"ease","pt":$n[4].Ease,"ps":2}],"sn":"DOZoom","rt":$n[4].Tween,"p":[$n[0].Single,$n[0].Single,$n[4].Ease]},{"a":1,"n":"GetPanDirection","t":8,"pi":[{"n":"input","pt":$n[2].Vector2,"ps":0}],"sn":"GetPanDirection","rt":$n[2].Vector3,"p":[$n[2].Vector2]},{"a":1,"n":"HandleZoom","t":8,"sn":"HandleZoom","rt":$n[0].Void},{"a":1,"n":"KillTweens","t":8,"sn":"KillTweens","rt":$n[0].Void},{"a":1,"n":"PanToClick","t":8,"pi":[{"n":"mousePos","pt":$n[2].Vector3,"ps":0}],"sn":"PanToClick","rt":$n[0].Void,"p":[$n[2].Vector3]},{"a":2,"n":"Shake","t":8,"sn":"Shake","rt":$n[0].Void},{"a":2,"n":"Shake","t":8,"pi":[{"n":"duration","pt":$n[0].Single,"ps":0},{"n":"strength","pt":$n[0].Single,"ps":1}],"sn":"Shake$1","rt":$n[0].Void,"p":[$n[0].Single,$n[0].Single]},{"a":1,"n":"SmoothPan","t":8,"sn":"SmoothPan","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"a":2,"n":"Instance","is":true,"t":16,"rt":CameraManager,"g":{"a":2,"n":"get_Instance","t":8,"rt":CameraManager,"fg":"Instance","is":true},"s":{"a":1,"n":"set_Instance","t":8,"p":[CameraManager],"rt":$n[0].Void,"fs":"Instance","is":true},"fn":"Instance"},{"at":[new UnityEngine.HeaderAttribute("Animation Settings")],"a":2,"n":"IsAnimation","t":4,"rt":$n[0].Boolean,"sn":"IsAnimation","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("Animation Sequence Settings")],"a":2,"n":"IsAnimationSeq","t":4,"rt":$n[0].Boolean,"sn":"IsAnimationSeq","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("Panning Settings")],"a":2,"n":"IsPan","t":4,"rt":$n[0].Boolean,"sn":"IsPan","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("Shake Settings")],"a":2,"n":"IsShake","t":4,"rt":$n[0].Boolean,"sn":"IsShake","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("Zoom Settings")],"a":2,"n":"IsZoom","t":4,"rt":$n[0].Boolean,"sn":"IsZoom","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"PanAxis","t":4,"rt":PanAxis,"sn":"PanAxis","box":function ($v) { return Bridge.box($v, PanAxis, System.Enum.toStringFn(PanAxis));}},{"a":2,"n":"PanLayer","t":4,"rt":$n[2].LayerMask,"sn":"PanLayer"},{"a":1,"n":"animationDuration","t":4,"rt":$n[0].Single,"sn":"animationDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"animationEase","t":4,"rt":$n[4].Ease,"sn":"animationEase","box":function ($v) { return Bridge.box($v, DG.Tweening.Ease, System.Enum.toStringFn(DG.Tweening.Ease));}},{"a":1,"n":"animationSeqEase","t":4,"rt":$n[4].Ease,"sn":"animationSeqEase","box":function ($v) { return Bridge.box($v, DG.Tweening.Ease, System.Enum.toStringFn(DG.Tweening.Ease));}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"animationSeqSteps","t":4,"rt":System.Array.type(AnimationSeqStep),"sn":"animationSeqSteps"},{"a":1,"n":"animationSeqTween","t":4,"rt":$n[4].Tween,"sn":"animationSeqTween"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"animationSteps","t":4,"rt":System.Array.type(AnimationStep),"sn":"animationSteps"},{"a":1,"n":"animationTween","t":4,"rt":$n[4].Tween,"sn":"animationTween"},{"a":1,"n":"animationZoom","t":4,"rt":$n[0].Single,"sn":"animationZoom","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"cam","t":4,"rt":$n[2].Camera,"sn":"cam"},{"a":1,"n":"clickPanDuration","t":4,"rt":$n[0].Single,"sn":"clickPanDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"clickPanThreshold","t":4,"rt":$n[0].Single,"sn":"clickPanThreshold","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"currentAnimationIndex","t":4,"rt":$n[0].Int32,"sn":"currentAnimationIndex","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"distanceClamp","t":4,"rt":$n[0].Single,"sn":"distanceClamp","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"isPannable","t":4,"rt":$n[0].Boolean,"sn":"isPannable","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isPanning","t":4,"rt":$n[0].Boolean,"sn":"isPanning","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isZoomable","t":4,"rt":$n[0].Boolean,"sn":"isZoomable","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isZooming","t":4,"rt":$n[0].Boolean,"sn":"isZooming","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"lastInputPos","t":4,"rt":$n[2].Vector3,"sn":"lastInputPos"},{"a":1,"n":"mouseDownPos","t":4,"rt":$n[2].Vector3,"sn":"mouseDownPos"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"originVector","t":4,"rt":$n[2].Vector3,"sn":"originVector"},{"a":1,"n":"panSensitivity","t":4,"rt":$n[0].Single,"sn":"panSensitivity","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"panTarget","t":4,"rt":$n[2].Vector3,"sn":"panTarget"},{"a":1,"n":"panTween","t":4,"rt":$n[4].Tween,"sn":"panTween"},{"a":1,"n":"shakeIntensity","t":4,"rt":$n[0].Single,"sn":"shakeIntensity","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"shakeRandomness","t":4,"rt":$n[0].Single,"sn":"shakeRandomness","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"shakeTime","t":4,"rt":$n[0].Single,"sn":"shakeTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"shakeTween","t":4,"rt":$n[4].Tween,"sn":"shakeTween"},{"a":1,"n":"shakeVibrato","t":4,"rt":$n[0].Int32,"sn":"shakeVibrato","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"zoomIn","t":4,"rt":$n[0].Single,"sn":"zoomIn","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"zoomOut","t":4,"rt":$n[0].Single,"sn":"zoomOut","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"zoomSensitivity","t":4,"rt":$n[0].Single,"sn":"zoomSensitivity","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"zoomTween","t":4,"rt":$n[4].Tween,"sn":"zoomTween"},{"a":1,"backing":true,"n":"<Instance>k__BackingField","is":true,"t":4,"rt":CameraManager,"sn":"Instance"}]}; }, $n);
    /*CameraManager end.*/

    /*ClickCounter start.*/
    $m("ClickCounter", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"clicks","pt":$n[0].Int32,"ps":0}],"sn":"Initialize","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":2,"n":"RegisterClick","t":8,"sn":"RegisterClick","rt":$n[0].Void},{"a":2,"n":"Instance","is":true,"t":4,"rt":ClickCounter,"sn":"Instance"}]}; }, $n);
    /*ClickCounter end.*/

    /*ControlManager start.*/
    $m("ControlManager", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(CTAManager)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"ControllersManagers","t":8,"sn":"ControllersManagers","rt":$n[0].Void},{"a":2,"n":"ForceRelease","t":8,"sn":"ForceRelease","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"at":[new UnityEngine.HeaderAttribute("QA Defensive Measures")],"a":2,"n":"Instance","is":true,"t":4,"rt":ControlManager,"sn":"Instance"},{"at":[new UnityEngine.HideInInspector()],"a":2,"n":"IsGameLocked","t":4,"rt":$n[0].Boolean,"sn":"IsGameLocked","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HideInInspector()],"a":2,"n":"IsHolding","t":4,"rt":$n[0].Boolean,"sn":"IsHolding","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"activate","t":4,"rt":System.Array.type(UnityEngine.GameObject),"sn":"activate"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"controlLayer","t":4,"rt":$n[2].LayerMask,"sn":"controlLayer"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"deactivate","t":4,"rt":System.Array.type(UnityEngine.GameObject),"sn":"deactivate"},{"a":1,"n":"isStarted","t":4,"rt":$n[0].Boolean,"sn":"isStarted","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"selectedGameObject","t":4,"rt":$n[2].GameObject,"sn":"selectedGameObject"}]}; }, $n);
    /*ControlManager end.*/

    /*CTAManager start.*/
    $m("CTAManager", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(ControlManager),new UnityEngine.RequireComponent.ctor(IterationVariantManagers),new UnityEngine.RequireComponent.ctor(ScoreManager)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"CTAClick","t":8,"sn":"CTAClick","rt":$n[0].Void},{"a":2,"n":"CTAClickAlt","t":8,"sn":"CTAClickAlt","rt":$n[0].Void},{"a":2,"n":"EnableCTA","t":8,"sn":"EnableCTA","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"a":2,"n":"Instance","is":true,"t":4,"rt":CTAManager,"sn":"Instance"},{"at":[new UnityEngine.HideInInspector()],"a":2,"n":"IsCTA","t":4,"rt":$n[0].Boolean,"sn":"IsCTA","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"androidLink","t":4,"rt":$n[0].String,"sn":"androidLink"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"iosLink","t":4,"rt":$n[0].String,"sn":"iosLink"}]}; }, $n);
    /*CTAManager end.*/

    /*GameManager start.*/
    $m("GameManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CanBrickMove","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0},{"n":"direction","pt":$n[2].Vector3,"ps":1}],"sn":"CanBrickMove","rt":$n[0].Boolean,"p":[Brick,$n[2].Vector3],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"GetAlpha","t":8,"sn":"GetAlpha","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"GetBrickCenter","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0}],"sn":"GetBrickCenter","rt":$n[2].Vector3,"p":[Brick]},{"a":1,"n":"GetDirectionToMatchingGate","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0}],"sn":"GetDirectionToMatchingGate","rt":$n[2].Vector3,"p":[Brick]},{"a":1,"n":"HighlightGateColor","t":8,"sn":"HighlightGateColor","rt":$n[0].Void},{"a":1,"n":"SetAlpha","t":8,"pi":[{"n":"value","pt":$n[0].Single,"ps":0}],"sn":"SetAlpha","rt":$n[0].Void,"p":[$n[0].Single]},{"a":1,"n":"SetMaterialAlpha","t":8,"pi":[{"n":"material","pt":$n[2].Material,"ps":0},{"n":"alpha","pt":$n[0].Single,"ps":1}],"sn":"SetMaterialAlpha","rt":$n[0].Void,"p":[$n[2].Material,$n[0].Single]},{"a":1,"n":"ShuffleDirections","t":8,"sn":"ShuffleDirections","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"StartGateHighlight","t":8,"pi":[{"n":"index","pt":$n[0].Int32,"ps":0}],"sn":"StartGateHighlight","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":2,"n":"StartHint","t":8,"sn":"StartHint","rt":$n[0].Void},{"a":1,"n":"StartHintHandAnimationLoop","t":8,"sn":"StartHintHandAnimationLoop","rt":$n[0].Void},{"a":2,"n":"StartTutorial","t":8,"sn":"StartTutorial","rt":$n[0].Void},{"a":1,"n":"StopGateHighlights","t":8,"sn":"StopGateHighlights","rt":$n[0].Void},{"a":2,"n":"StopHint","t":8,"sn":"StopHint","rt":$n[0].Void},{"a":2,"n":"StopTutorial","t":8,"sn":"StopTutorial","rt":$n[0].Void},{"a":1,"n":"TryFindValidMove","t":8,"sn":"TryFindValidMove","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":2,"n":"Board","t":4,"rt":$n[2].GameObject,"sn":"Board"},{"at":[new UnityEngine.HeaderAttribute("Optional Starting Hint"),new UnityEngine.Serialization.FormerlySerializedAsAttribute("HasUsedStartingBrick"),new UnityEngine.HideInInspector()],"a":2,"n":"HasUsedStartingHint","t":4,"rt":$n[0].Boolean,"sn":"HasUsedStartingHint","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"Instance","is":true,"t":4,"rt":GameManager,"sn":"Instance"},{"at":[new UnityEngine.Serialization.FormerlySerializedAsAttribute("IsTutorialActive"),new UnityEngine.HideInInspector()],"a":2,"n":"IsHintActive","t":4,"rt":$n[0].Boolean,"sn":"IsHintActive","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"directions","t":4,"rt":System.Array.type(UnityEngine.Vector3),"sn":"directions","ro":true},{"a":1,"n":"handMat","t":4,"rt":$n[2].Material,"sn":"handMat"},{"at":[new UnityEngine.HeaderAttribute("Hint References"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"handPointer","t":4,"rt":$n[2].Transform,"sn":"handPointer"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"handRenderer","t":4,"rt":$n[2].Renderer,"sn":"handRenderer"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"highlight","t":4,"rt":System.Array.type(UnityEngine.GameObject),"sn":"highlight"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"hintDelay","t":4,"rt":$n[0].Single,"sn":"hintDelay","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"hintLoopSequence","t":4,"rt":$n[4].Sequence,"sn":"hintLoopSequence"},{"a":1,"n":"hintMoveDirection","t":4,"rt":$n[2].Vector3,"sn":"hintMoveDirection"},{"at":[new UnityEngine.HideInInspector(),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"hintTimer","t":4,"rt":$n[0].Single,"sn":"hintTimer","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Hint Target"),new UnityEngine.Serialization.FormerlySerializedAsAttribute("chosenBrick"),new UnityEngine.SerializeFieldAttribute(),new ReadOnlyAttribute()],"a":1,"n":"hintedBrick","t":4,"rt":Brick,"sn":"hintedBrick"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"startingBrick","t":4,"rt":Brick,"sn":"startingBrick"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"startingDirection","t":4,"rt":$n[2].Vector3,"sn":"startingDirection"}]}; }, $n);
    /*GameManager end.*/

    /*Gate start.*/
    $m("Gate", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Absorb","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0}],"sn":"Absorb","rt":$n[0].Void,"p":[Brick]},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"CanAccept","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0}],"sn":"CanAccept","rt":$n[0].Boolean,"p":[Brick],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"CheckWin","t":8,"sn":"CheckWin","rt":$n[0].Void},{"a":1,"n":"FindNearbySlots","t":8,"sn":"FindNearbySlots","rt":$n[0].Void},{"a":2,"n":"Lower","t":8,"sn":"Lower","rt":$n[0].Void},{"a":2,"n":"MatchesColor","t":8,"pi":[{"n":"color","pt":$n[2].Color,"ps":0}],"sn":"MatchesColor","rt":$n[0].Boolean,"p":[$n[2].Color],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"StartBounce","t":8,"sn":"StartBounce","rt":$n[0].Void},{"a":2,"n":"StartBounceMatchingGates","is":true,"t":8,"pi":[{"n":"color","pt":$n[2].Color,"ps":0}],"sn":"StartBounceMatchingGates","rt":$n[0].Void,"p":[$n[2].Color]},{"a":2,"n":"StopBounce","t":8,"sn":"StopBounce","rt":$n[0].Void},{"a":2,"n":"StopBounceMatchingGates","is":true,"t":8,"pi":[{"n":"color","pt":$n[2].Color,"ps":0}],"sn":"StopBounceMatchingGates","rt":$n[0].Void,"p":[$n[2].Color]},{"a":2,"n":"VfxPosition","t":16,"rt":$n[2].Vector3,"g":{"a":2,"n":"get_VfxPosition","t":8,"rt":$n[2].Vector3,"fg":"VfxPosition"},"fn":"VfxPosition"},{"a":1,"n":"ColorMatchTolerance","is":true,"t":4,"rt":$n[0].Single,"sn":"ColorMatchTolerance","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Detection")],"a":2,"n":"GridSlotLayer","t":4,"rt":$n[2].LayerMask,"sn":"GridSlotLayer"},{"a":2,"n":"acceptDirection","t":4,"rt":$n[2].Vector3,"sn":"acceptDirection"},{"a":2,"n":"allGates","is":true,"t":4,"rt":$n[1].List$1(Gate),"sn":"allGates"},{"a":1,"n":"autoLowerTween","t":4,"rt":$n[4].Tween,"sn":"autoLowerTween"},{"a":2,"n":"boxPosition","t":4,"rt":$n[2].Vector3,"sn":"boxPosition"},{"a":2,"n":"boxSize","t":4,"rt":$n[2].Vector3,"sn":"boxSize"},{"at":[new UnityEngine.HeaderAttribute("Parts"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"gate","t":4,"rt":$n[2].Transform,"sn":"gate"},{"a":2,"n":"gateColor","t":4,"rt":$n[2].Color,"sn":"gateColor"},{"a":1,"n":"gateOriginalLocalPos","t":4,"rt":$n[2].Vector3,"sn":"gateOriginalLocalPos"},{"a":1,"n":"gateOriginalLocalRot","t":4,"rt":$n[2].Quaternion,"sn":"gateOriginalLocalRot"},{"at":[new UnityEngine.HeaderAttribute("Gate Slots")],"a":2,"n":"gateSlots","t":4,"rt":$n[1].List$1(GridSlot),"sn":"gateSlots"},{"a":1,"n":"isBouncing","t":4,"rt":$n[0].Boolean,"sn":"isBouncing","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"offset","t":4,"rt":$n[0].Single,"sn":"offset","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"originalLocalPos","t":4,"rt":$n[2].Vector3,"sn":"originalLocalPos"},{"a":1,"n":"raiseDuration","t":4,"rt":$n[0].Single,"sn":"raiseDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("Effects"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"vfxs","t":4,"rt":System.Array.type(UnityEngine.ParticleSystem),"sn":"vfxs"}]}; }, $n);
    /*Gate end.*/

    /*GridSlot start.*/
    $m("GridSlot", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Clear","t":8,"sn":"Clear","rt":$n[0].Void},{"a":1,"n":"DetectInitialBrick","t":8,"sn":"DetectInitialBrick","rt":$n[0].Void},{"a":2,"n":"SetOccupying","t":8,"pi":[{"n":"brick","pt":Brick,"ps":0}],"sn":"SetOccupying","rt":$n[0].Void,"p":[Brick]},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"IsOccupied","t":16,"rt":$n[0].Boolean,"g":{"a":2,"n":"get_IsOccupied","t":8,"rt":$n[0].Boolean,"fg":"IsOccupied","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"IsOccupied"},{"a":2,"n":"WorldPosition","t":16,"rt":$n[2].Vector3,"g":{"a":2,"n":"get_WorldPosition","t":8,"rt":$n[2].Vector3,"fg":"WorldPosition"},"fn":"WorldPosition"},{"at":[new UnityEngine.HeaderAttribute("Detection"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"brickLayer","t":4,"rt":$n[2].LayerMask,"sn":"brickLayer"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"checkBoxSize","t":4,"rt":$n[2].Vector3,"sn":"checkBoxSize"},{"at":[new UnityEngine.HeaderAttribute("Brick")],"a":2,"n":"occupyingBrick","t":4,"rt":Brick,"sn":"occupyingBrick"}]}; }, $n);
    /*GridSlot end.*/

    /*IterationVariantManagers start.*/
    $m("IterationVariantManagers", function () { return {"nested":[IterationVariantManagers.VariantType,IterationVariantManagers.IterationType],"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(CTAManager)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"ApplyIterationAndVariantMode","t":8,"sn":"ApplyIterationAndVariantMode","rt":$n[0].Void},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"CanShowEndCardOnLastBricks","t":8,"sn":"CanShowEndCardOnLastBricks","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"ConfigureClickLimit","t":8,"pi":[{"n":"clicks","pt":$n[0].Int32,"ps":0},{"n":"autoRedirect","pt":$n[0].Boolean,"ps":1}],"sn":"ConfigureClickLimit","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Boolean]},{"a":1,"n":"ConfigureFull","t":8,"sn":"ConfigureFull","rt":$n[0].Void},{"a":1,"n":"ConfigureTimeLimit","t":8,"pi":[{"n":"seconds","pt":$n[0].Single,"ps":0},{"n":"autoRedirect","pt":$n[0].Boolean,"ps":1}],"sn":"ConfigureTimeLimit","rt":$n[0].Void,"p":[$n[0].Single,$n[0].Boolean]},{"a":2,"n":"RegisterClick","t":8,"sn":"RegisterClick","rt":$n[0].Void},{"a":1,"n":"SetupVariant","t":8,"pi":[{"n":"index","pt":$n[0].Int32,"ps":0}],"sn":"SetupVariant","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":2,"n":"ShowEndCard","t":8,"pi":[{"n":"isWin","dv":false,"o":true,"pt":$n[0].Boolean,"ps":0}],"sn":"ShowEndCard","rt":$n[0].Void,"p":[$n[0].Boolean]},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"StartIteration","t":8,"sn":"StartIteration","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"a":1,"n":"UpdateClickTexts","t":8,"pi":[{"n":"value","pt":$n[0].Int32,"ps":0}],"sn":"UpdateClickTexts","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"UpdateClickTexts","t":8,"pi":[{"n":"value","pt":$n[0].String,"ps":0}],"sn":"UpdateClickTexts$1","rt":$n[0].Void,"p":[$n[0].String]},{"a":1,"n":"UpdateTimerTexts","t":8,"pi":[{"n":"value","pt":$n[0].Int32,"ps":0}],"sn":"UpdateTimerTexts","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"UpdateTimerTexts","t":8,"pi":[{"n":"value","pt":$n[0].String,"ps":0}],"sn":"UpdateTimerTexts$1","rt":$n[0].Void,"p":[$n[0].String]},{"at":[new UnityEngine.HeaderAttribute("Iteration"),new UnityEngine.LunaPlaygroundFieldAttribute("Iteration Type", 2, "Iteration Settings", false, "Iteration"),new UnityEngine.SerializeFieldAttribute()],"a":2,"n":"ActiveIterationType","t":4,"rt":IterationVariantManagers.IterationType,"sn":"ActiveIterationType","box":function ($v) { return Bridge.box($v, IterationVariantManagers.IterationType, System.Enum.toStringFn(IterationVariantManagers.IterationType));}},{"at":[new UnityEngine.HeaderAttribute("Variant"),new UnityEngine.LunaPlaygroundFieldAttribute("Variant Type", 0, "Variant Settings", false, "Variant"),new UnityEngine.SerializeFieldAttribute()],"a":2,"n":"ActiveVariantType","t":4,"rt":IterationVariantManagers.VariantType,"sn":"ActiveVariantType","box":function ($v) { return Bridge.box($v, IterationVariantManagers.VariantType, System.Enum.toStringFn(IterationVariantManagers.VariantType));}},{"a":1,"n":"FourClickLimit","is":true,"t":4,"rt":$n[0].Int32,"sn":"FourClickLimit","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Instance","is":true,"t":4,"rt":IterationVariantManagers,"sn":"Instance"},{"a":1,"n":"ThirtySecondLimit","is":true,"t":4,"rt":$n[0].Single,"sn":"ThirtySecondLimit","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"clickTexts","t":4,"rt":System.Array.type(TMPro.TMP_Text),"sn":"clickTexts"},{"a":1,"n":"currentClicks","t":4,"rt":$n[0].Int32,"sn":"currentClicks","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"endCardAnimationDuration","t":4,"rt":$n[0].Single,"sn":"endCardAnimationDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("End Card"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"endCards","t":4,"rt":System.Array.type(UnityEngine.CanvasGroup),"sn":"endCards"},{"a":1,"n":"isApplied","t":4,"rt":$n[0].Boolean,"sn":"isApplied","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isClickLimited","t":4,"rt":$n[0].Boolean,"sn":"isClickLimited","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isEndCardShown","t":4,"rt":$n[0].Boolean,"sn":"isEndCardShown","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isRunning","t":4,"rt":$n[0].Boolean,"sn":"isRunning","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"isTimeLimited","t":4,"rt":$n[0].Boolean,"sn":"isTimeLimited","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"redirectsBeforeEndCard","t":4,"rt":$n[0].Boolean,"sn":"redirectsBeforeEndCard","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"scoreTarget","t":4,"rt":$n[0].Int32,"sn":"scoreTarget","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"targetClicks","t":4,"rt":$n[0].Int32,"sn":"targetClicks","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"timeLeft","t":4,"rt":$n[0].Single,"sn":"timeLeft","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"timerTexts","t":4,"rt":System.Array.type(TMPro.TMP_Text),"sn":"timerTexts"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"variants","t":4,"rt":System.Array.type(UnityEngine.GameObject),"sn":"variants"}]}; }, $n);
    /*IterationVariantManagers end.*/

    /*IterationVariantManagers+VariantType start.*/
    $m("IterationVariantManagers.VariantType", function () { return {"td":IterationVariantManagers,"att":258,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Var0","is":true,"t":4,"rt":IterationVariantManagers.VariantType,"sn":"Var0","box":function ($v) { return Bridge.box($v, IterationVariantManagers.VariantType, System.Enum.toStringFn(IterationVariantManagers.VariantType));}}]}; }, $n);
    /*IterationVariantManagers+VariantType end.*/

    /*IterationVariantManagers+IterationType start.*/
    $m("IterationVariantManagers.IterationType", function () { return {"td":IterationVariantManagers,"att":258,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"FourClicks","is":true,"t":4,"rt":IterationVariantManagers.IterationType,"sn":"FourClicks","box":function ($v) { return Bridge.box($v, IterationVariantManagers.IterationType, System.Enum.toStringFn(IterationVariantManagers.IterationType));}},{"a":2,"n":"Full","is":true,"t":4,"rt":IterationVariantManagers.IterationType,"sn":"Full","box":function ($v) { return Bridge.box($v, IterationVariantManagers.IterationType, System.Enum.toStringFn(IterationVariantManagers.IterationType));}},{"a":2,"n":"ThirtySeconds","is":true,"t":4,"rt":IterationVariantManagers.IterationType,"sn":"ThirtySeconds","box":function ($v) { return Bridge.box($v, IterationVariantManagers.IterationType, System.Enum.toStringFn(IterationVariantManagers.IterationType));}}]}; }, $n);
    /*IterationVariantManagers+IterationType end.*/

    /*ReadOnlyAttribute start.*/
    $m("ReadOnlyAttribute", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"}]}; }, $n);
    /*ReadOnlyAttribute end.*/

    /*ScoreManager start.*/
    $m("ScoreManager", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(CTAManager)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"AddScore","t":8,"pi":[{"n":"amount","pt":$n[0].Int32,"ps":0}],"sn":"AddScore","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"GetScore","t":8,"sn":"GetScore","rt":$n[0].Int32,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"TotalScore","pt":$n[0].Int32,"ps":0}],"sn":"Initialize","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"UpdateUIImmediate","t":8,"sn":"UpdateUIImmediate","rt":$n[0].Void},{"a":2,"n":"Instance","is":true,"t":4,"rt":ScoreManager,"sn":"Instance"},{"at":[new UnityEngine.HeaderAttribute("UI"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"fillBar","t":4,"rt":$n[5].Image,"sn":"fillBar"},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"fillImage","t":4,"rt":$n[5].Image,"sn":"fillImage"},{"a":1,"n":"score","t":4,"rt":$n[0].Int32,"sn":"score","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"scoreTexts","t":4,"rt":System.Array.type(TMPro.TMP_Text),"sn":"scoreTexts"},{"at":[new UnityEngine.HeaderAttribute("Starting Values"),new UnityEngine.RangeAttribute(0.0, 1.0),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"startingFillPercent","t":4,"rt":$n[0].Single,"sn":"startingFillPercent","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"totalScore","t":4,"rt":$n[0].Int32,"sn":"totalScore","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*ScoreManager end.*/

    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty start.*/
    $m("IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"}]}; }, $n);
    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty end.*/

    /*DG.Tweening.DOTweenModuleAudio start.*/
    $m("DG.Tweening.DOTweenModuleAudio", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOComplete","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0},{"n":"withCallbacks","dv":false,"o":true,"pt":$n[0].Boolean,"ps":1}],"sn":"DOComplete","rt":$n[0].Int32,"p":[$n[6].AudioMixer,$n[0].Boolean],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].AudioSource,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[2].AudioSource,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFlip","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOFlip","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOGoto","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0},{"n":"to","pt":$n[0].Single,"ps":1},{"n":"andPlay","dv":false,"o":true,"pt":$n[0].Boolean,"ps":2}],"sn":"DOGoto","rt":$n[0].Int32,"p":[$n[6].AudioMixer,$n[0].Single,$n[0].Boolean],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOKill","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0},{"n":"complete","dv":false,"o":true,"pt":$n[0].Boolean,"ps":1}],"sn":"DOKill","rt":$n[0].Int32,"p":[$n[6].AudioMixer,$n[0].Boolean],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOPause","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOPause","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOPitch","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].AudioSource,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOPitch","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[2].AudioSource,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOPlay","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOPlay","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOPlayBackwards","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOPlayBackwards","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOPlayForward","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOPlayForward","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DORestart","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DORestart","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DORewind","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DORewind","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOSetFloat","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0},{"n":"floatName","pt":$n[0].String,"ps":1},{"n":"endValue","pt":$n[0].Single,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"DOSetFloat","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[6].AudioMixer,$n[0].String,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOSmoothRewind","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOSmoothRewind","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"DOTogglePause","is":true,"t":8,"pi":[{"n":"target","pt":$n[6].AudioMixer,"ps":0}],"sn":"DOTogglePause","rt":$n[0].Int32,"p":[$n[6].AudioMixer],"box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*DG.Tweening.DOTweenModuleAudio end.*/

    /*DG.Tweening.DOTweenModulePhysics start.*/
    $m("DG.Tweening.DOTweenModulePhysics", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOJump","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[2].Vector3,"ps":1},{"n":"jumpPower","pt":$n[0].Single,"ps":2},{"n":"numJumps","pt":$n[0].Int32,"ps":3},{"n":"duration","pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5}],"sn":"DOJump","rt":$n[4].Sequence,"p":[$n[2].Rigidbody,$n[2].Vector3,$n[0].Single,$n[0].Int32,$n[0].Single,$n[0].Boolean]},{"a":4,"n":"DOLocalPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"path","pt":$n[8].Path,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":3}],"sn":"DOLocalPath$1","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody,$n[8].Path,$n[0].Single,$n[4].PathMode]},{"a":2,"n":"DOLocalPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"path","pt":System.Array.type(UnityEngine.Vector3),"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathType","dv":0,"o":true,"pt":$n[4].PathType,"ps":3},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":4},{"n":"resolution","dv":10,"o":true,"pt":$n[0].Int32,"ps":5},{"n":"gizmoColor","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Color),"ps":6}],"sn":"DOLocalPath","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody,System.Array.type(UnityEngine.Vector3),$n[0].Single,$n[4].PathType,$n[4].PathMode,$n[0].Int32,$n[0].Nullable$1(UnityEngine.Color)]},{"a":2,"n":"DOLookAt","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"towards","pt":$n[2].Vector3,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"axisConstraint","dv":0,"o":true,"pt":$n[4].AxisConstraint,"ps":3},{"n":"up","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Vector3),"ps":4}],"sn":"DOLookAt","rt":$n[7].TweenerCore$3(UnityEngine.Quaternion,UnityEngine.Vector3,DG.Tweening.Plugins.Options.QuaternionOptions),"p":[$n[2].Rigidbody,$n[2].Vector3,$n[0].Single,$n[4].AxisConstraint,$n[0].Nullable$1(UnityEngine.Vector3)]},{"a":2,"n":"DOMove","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[2].Vector3,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMove","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody,$n[2].Vector3,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMoveX","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMoveX","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMoveY","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMoveY","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMoveZ","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMoveZ","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":4,"n":"DOPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"path","pt":$n[8].Path,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":3}],"sn":"DOPath$1","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody,$n[8].Path,$n[0].Single,$n[4].PathMode]},{"a":2,"n":"DOPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"path","pt":System.Array.type(UnityEngine.Vector3),"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathType","dv":0,"o":true,"pt":$n[4].PathType,"ps":3},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":4},{"n":"resolution","dv":10,"o":true,"pt":$n[0].Int32,"ps":5},{"n":"gizmoColor","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Color),"ps":6}],"sn":"DOPath","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody,System.Array.type(UnityEngine.Vector3),$n[0].Single,$n[4].PathType,$n[4].PathMode,$n[0].Int32,$n[0].Nullable$1(UnityEngine.Color)]},{"a":2,"n":"DORotate","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody,"ps":0},{"n":"endValue","pt":$n[2].Vector3,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"mode","dv":0,"o":true,"pt":$n[4].RotateMode,"ps":3}],"sn":"DORotate","rt":$n[7].TweenerCore$3(UnityEngine.Quaternion,UnityEngine.Vector3,DG.Tweening.Plugins.Options.QuaternionOptions),"p":[$n[2].Rigidbody,$n[2].Vector3,$n[0].Single,$n[4].RotateMode]}]}; }, $n);
    /*DG.Tweening.DOTweenModulePhysics end.*/

    /*DG.Tweening.DOTweenModulePhysics2D start.*/
    $m("DG.Tweening.DOTweenModulePhysics2D", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOJump","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"jumpPower","pt":$n[0].Single,"ps":2},{"n":"numJumps","pt":$n[0].Int32,"ps":3},{"n":"duration","pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5}],"sn":"DOJump","rt":$n[4].Sequence,"p":[$n[2].Rigidbody2D,$n[2].Vector2,$n[0].Single,$n[0].Int32,$n[0].Single,$n[0].Boolean]},{"a":4,"n":"DOLocalPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"path","pt":$n[8].Path,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":3}],"sn":"DOLocalPath$1","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody2D,$n[8].Path,$n[0].Single,$n[4].PathMode]},{"a":2,"n":"DOLocalPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"path","pt":System.Array.type(UnityEngine.Vector2),"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathType","dv":0,"o":true,"pt":$n[4].PathType,"ps":3},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":4},{"n":"resolution","dv":10,"o":true,"pt":$n[0].Int32,"ps":5},{"n":"gizmoColor","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Color),"ps":6}],"sn":"DOLocalPath","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody2D,System.Array.type(UnityEngine.Vector2),$n[0].Single,$n[4].PathType,$n[4].PathMode,$n[0].Int32,$n[0].Nullable$1(UnityEngine.Color)]},{"a":2,"n":"DOMove","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMove","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody2D,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMoveX","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMoveX","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody2D,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMoveY","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMoveY","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Rigidbody2D,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":4,"n":"DOPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"path","pt":$n[8].Path,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":3}],"sn":"DOPath$1","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody2D,$n[8].Path,$n[0].Single,$n[4].PathMode]},{"a":2,"n":"DOPath","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"path","pt":System.Array.type(UnityEngine.Vector2),"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"pathType","dv":0,"o":true,"pt":$n[4].PathType,"ps":3},{"n":"pathMode","dv":1,"o":true,"pt":$n[4].PathMode,"ps":4},{"n":"resolution","dv":10,"o":true,"pt":$n[0].Int32,"ps":5},{"n":"gizmoColor","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Color),"ps":6}],"sn":"DOPath","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].Rigidbody2D,System.Array.type(UnityEngine.Vector2),$n[0].Single,$n[4].PathType,$n[4].PathMode,$n[0].Int32,$n[0].Nullable$1(UnityEngine.Color)]},{"a":2,"n":"DORotate","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Rigidbody2D,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DORotate","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[2].Rigidbody2D,$n[0].Single,$n[0].Single]}]}; }, $n);
    /*DG.Tweening.DOTweenModulePhysics2D end.*/

    /*DG.Tweening.DOTweenModuleSprite start.*/
    $m("DG.Tweening.DOTweenModuleSprite", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOBlendableColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].SpriteRenderer,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOBlendableColor","rt":$n[4].Tweener,"p":[$n[2].SpriteRenderer,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].SpriteRenderer,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOColor","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[2].SpriteRenderer,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].SpriteRenderer,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[2].SpriteRenderer,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOGradientColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].SpriteRenderer,"ps":0},{"n":"gradient","pt":pc.ColorGradient,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOGradientColor","rt":$n[4].Sequence,"p":[$n[2].SpriteRenderer,pc.ColorGradient,$n[0].Single]}]}; }, $n);
    /*DG.Tweening.DOTweenModuleSprite end.*/

    /*DG.Tweening.DOTweenModuleUI start.*/
    $m("DG.Tweening.DOTweenModuleUI", function () { return {"nested":[$n[4].DOTweenModuleUI.Utils],"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOAnchorMax","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorMax","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorMin","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorMin","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPos","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPos3D","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector3,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPos3D","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector3,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPos3DX","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPos3DX","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPos3DY","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPos3DY","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPos3DZ","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPos3DZ","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,UnityEngine.Vector3,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPosX","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPosX","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOAnchorPosY","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOAnchorPosY","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOBlendableColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Graphic,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOBlendableColor","rt":$n[4].Tweener,"p":[$n[5].Graphic,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOBlendableColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Image,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOBlendableColor$1","rt":$n[4].Tweener,"p":[$n[5].Image,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOBlendableColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Text,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOBlendableColor$2","rt":$n[4].Tweener,"p":[$n[5].Text,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Graphic,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOColor","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Graphic,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Image,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOColor$1","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Image,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Outline,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOColor$2","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Outline,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Text,"ps":0},{"n":"endValue","pt":$n[2].Color,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOColor$3","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Text,$n[2].Color,$n[0].Single]},{"a":2,"n":"DOCounter","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Text,"ps":0},{"n":"fromValue","pt":$n[0].Int32,"ps":1},{"n":"endValue","pt":$n[0].Int32,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3},{"n":"addThousandsSeparator","dv":true,"o":true,"pt":$n[0].Boolean,"ps":4},{"n":"culture","dv":null,"o":true,"pt":$n[9].CultureInfo,"ps":5}],"sn":"DOCounter","rt":$n[7].TweenerCore$3(System.Int32,System.Int32,DG.Tweening.Plugins.Options.NoOptions),"p":[$n[5].Text,$n[0].Int32,$n[0].Int32,$n[0].Single,$n[0].Boolean,$n[9].CultureInfo]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].CanvasGroup,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[2].CanvasGroup,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Graphic,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade$1","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Graphic,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Image,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade$2","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Image,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Outline,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade$3","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Outline,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFade","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Text,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFade$4","rt":$n[7].TweenerCore$3(UnityEngine.Color,UnityEngine.Color,DG.Tweening.Plugins.Options.ColorOptions),"p":[$n[5].Text,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFillAmount","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Image,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOFillAmount","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[5].Image,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOFlexibleSize","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].LayoutElement,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOFlexibleSize","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[5].LayoutElement,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOGradientColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Image,"ps":0},{"n":"gradient","pt":pc.ColorGradient,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOGradientColor","rt":$n[4].Sequence,"p":[$n[5].Image,pc.ColorGradient,$n[0].Single]},{"a":2,"n":"DOHorizontalNormalizedPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].ScrollRect,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOHorizontalNormalizedPos","rt":$n[4].Tweener,"p":[$n[5].ScrollRect,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOJumpAnchorPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"jumpPower","pt":$n[0].Single,"ps":2},{"n":"numJumps","pt":$n[0].Int32,"ps":3},{"n":"duration","pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5}],"sn":"DOJumpAnchorPos","rt":$n[4].Sequence,"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Int32,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOMinSize","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].LayoutElement,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOMinSize","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[5].LayoutElement,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DONormalizedPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].ScrollRect,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DONormalizedPos","rt":$n[4].Tweener,"p":[$n[5].ScrollRect,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOPivot","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOPivot","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single]},{"a":2,"n":"DOPivotX","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOPivotX","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOPivotY","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOPivotY","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single]},{"a":2,"n":"DOPreferredSize","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].LayoutElement,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOPreferredSize","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[5].LayoutElement,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOPunchAnchorPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"punch","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"vibrato","dv":10,"o":true,"pt":$n[0].Int32,"ps":3},{"n":"elasticity","dv":1.0,"o":true,"pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5}],"sn":"DOPunchAnchorPos","rt":$n[4].Tweener,"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Int32,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOScale","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Outline,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOScale","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[5].Outline,$n[2].Vector2,$n[0].Single]},{"a":2,"n":"DOShakeAnchorPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"duration","pt":$n[0].Single,"ps":1},{"n":"strength","dv":100.0,"o":true,"pt":$n[0].Single,"ps":2},{"n":"vibrato","dv":10,"o":true,"pt":$n[0].Int32,"ps":3},{"n":"randomness","dv":90.0,"o":true,"pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5},{"n":"fadeOut","dv":true,"o":true,"pt":$n[0].Boolean,"ps":6},{"n":"randomnessMode","dv":0,"o":true,"pt":$n[4].ShakeRandomnessMode,"ps":7}],"sn":"DOShakeAnchorPos","rt":$n[4].Tweener,"p":[$n[2].RectTransform,$n[0].Single,$n[0].Single,$n[0].Int32,$n[0].Single,$n[0].Boolean,$n[0].Boolean,$n[4].ShakeRandomnessMode]},{"a":2,"n":"DOShakeAnchorPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"duration","pt":$n[0].Single,"ps":1},{"n":"strength","pt":$n[2].Vector2,"ps":2},{"n":"vibrato","dv":10,"o":true,"pt":$n[0].Int32,"ps":3},{"n":"randomness","dv":90.0,"o":true,"pt":$n[0].Single,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5},{"n":"fadeOut","dv":true,"o":true,"pt":$n[0].Boolean,"ps":6},{"n":"randomnessMode","dv":0,"o":true,"pt":$n[4].ShakeRandomnessMode,"ps":7}],"sn":"DOShakeAnchorPos$1","rt":$n[4].Tweener,"p":[$n[2].RectTransform,$n[0].Single,$n[2].Vector2,$n[0].Int32,$n[0].Single,$n[0].Boolean,$n[0].Boolean,$n[4].ShakeRandomnessMode]},{"a":2,"n":"DOShapeCircle","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"center","pt":$n[2].Vector2,"ps":1},{"n":"endValueDegrees","pt":$n[0].Single,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3},{"n":"relativeCenter","dv":false,"o":true,"pt":$n[0].Boolean,"ps":4},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":5}],"sn":"DOShapeCircle","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.CircleOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Single,$n[0].Boolean,$n[0].Boolean]},{"a":2,"n":"DOSizeDelta","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].RectTransform,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOSizeDelta","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].RectTransform,$n[2].Vector2,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOText","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Text,"ps":0},{"n":"endValue","pt":$n[0].String,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"richTextEnabled","dv":true,"o":true,"pt":$n[0].Boolean,"ps":3},{"n":"scrambleMode","dv":0,"o":true,"pt":$n[4].ScrambleMode,"ps":4},{"n":"scrambleChars","dv":null,"o":true,"pt":$n[0].String,"ps":5}],"sn":"DOText","rt":$n[7].TweenerCore$3(System.String,System.String,DG.Tweening.Plugins.Options.StringOptions),"p":[$n[5].Text,$n[0].String,$n[0].Single,$n[0].Boolean,$n[4].ScrambleMode,$n[0].String]},{"a":2,"n":"DOValue","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].Slider,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOValue","rt":$n[7].TweenerCore$3(System.Single,System.Single,DG.Tweening.Plugins.Options.FloatOptions),"p":[$n[5].Slider,$n[0].Single,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"DOVerticalNormalizedPos","is":true,"t":8,"pi":[{"n":"target","pt":$n[5].ScrollRect,"ps":0},{"n":"endValue","pt":$n[0].Single,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2},{"n":"snapping","dv":false,"o":true,"pt":$n[0].Boolean,"ps":3}],"sn":"DOVerticalNormalizedPos","rt":$n[4].Tweener,"p":[$n[5].ScrollRect,$n[0].Single,$n[0].Single,$n[0].Boolean]}]}; }, $n);
    /*DG.Tweening.DOTweenModuleUI end.*/

    /*DG.Tweening.DOTweenModuleUI+Utils start.*/
    $m("DG.Tweening.DOTweenModuleUI.Utils", function () { return {"td":$n[4].DOTweenModuleUI,"att":1048962,"a":2,"s":true,"m":[{"a":2,"n":"SwitchToRectTransform","is":true,"t":8,"pi":[{"n":"from","pt":$n[2].RectTransform,"ps":0},{"n":"to","pt":$n[2].RectTransform,"ps":1}],"sn":"SwitchToRectTransform","rt":$n[2].Vector2,"p":[$n[2].RectTransform,$n[2].RectTransform]}]}; }, $n);
    /*DG.Tweening.DOTweenModuleUI+Utils end.*/

    /*DG.Tweening.DOTweenModuleUnityVersion start.*/
    $m("DG.Tweening.DOTweenModuleUnityVersion", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"DOGradientColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Material,"ps":0},{"n":"gradient","pt":pc.ColorGradient,"ps":1},{"n":"duration","pt":$n[0].Single,"ps":2}],"sn":"DOGradientColor","rt":$n[4].Sequence,"p":[$n[2].Material,pc.ColorGradient,$n[0].Single]},{"a":2,"n":"DOGradientColor","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Material,"ps":0},{"n":"gradient","pt":pc.ColorGradient,"ps":1},{"n":"property","pt":$n[0].String,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"DOGradientColor$1","rt":$n[4].Sequence,"p":[$n[2].Material,pc.ColorGradient,$n[0].String,$n[0].Single]},{"a":2,"n":"DOOffset","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Material,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"propertyID","pt":$n[0].Int32,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"DOOffset","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Material,$n[2].Vector2,$n[0].Int32,$n[0].Single]},{"a":2,"n":"DOTiling","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Material,"ps":0},{"n":"endValue","pt":$n[2].Vector2,"ps":1},{"n":"propertyID","pt":$n[0].Int32,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"DOTiling","rt":$n[7].TweenerCore$3(UnityEngine.Vector2,UnityEngine.Vector2,DG.Tweening.Plugins.Options.VectorOptions),"p":[$n[2].Material,$n[2].Vector2,$n[0].Int32,$n[0].Single]},{"a":2,"n":"WaitForCompletion","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":1}],"sn":"WaitForCompletion","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Boolean]},{"a":2,"n":"WaitForElapsedLoops","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"elapsedLoops","pt":$n[0].Int32,"ps":1},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":2}],"sn":"WaitForElapsedLoops","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Int32,$n[0].Boolean]},{"a":2,"n":"WaitForKill","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":1}],"sn":"WaitForKill","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Boolean]},{"a":2,"n":"WaitForPosition","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"position","pt":$n[0].Single,"ps":1},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":2}],"sn":"WaitForPosition","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Single,$n[0].Boolean]},{"a":2,"n":"WaitForRewind","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":1}],"sn":"WaitForRewind","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Boolean]},{"a":2,"n":"WaitForStart","is":true,"t":8,"pi":[{"n":"t","pt":$n[4].Tween,"ps":0},{"n":"returnCustomYieldInstruction","pt":$n[0].Boolean,"ps":1}],"sn":"WaitForStart","rt":$n[2].CustomYieldInstruction,"p":[$n[4].Tween,$n[0].Boolean]}]}; }, $n);
    /*DG.Tweening.DOTweenModuleUnityVersion end.*/

    /*DG.Tweening.DOTweenCYInstruction start.*/
    $m("DG.Tweening.DOTweenCYInstruction", function () { return {"nested":[$n[4].DOTweenCYInstruction.WaitForCompletion,$n[4].DOTweenCYInstruction.WaitForRewind,$n[4].DOTweenCYInstruction.WaitForKill,$n[4].DOTweenCYInstruction.WaitForElapsedLoops,$n[4].DOTweenCYInstruction.WaitForPosition,$n[4].DOTweenCYInstruction.WaitForStart],"att":1048961,"a":2,"s":true}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForCompletion start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForCompletion", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForCompletion end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForRewind start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForRewind", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForRewind end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForKill start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForKill", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForKill end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForElapsedLoops start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForElapsedLoops", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween,$n[0].Int32],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0},{"n":"elapsedLoops","pt":$n[0].Int32,"ps":1}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"elapsedLoops","t":4,"rt":$n[0].Int32,"sn":"elapsedLoops","ro":true,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForElapsedLoops end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForPosition start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForPosition", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween,$n[0].Single],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0},{"n":"position","pt":$n[0].Single,"ps":1}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"position","t":4,"rt":$n[0].Single,"sn":"position","ro":true,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForPosition end.*/

    /*DG.Tweening.DOTweenCYInstruction+WaitForStart start.*/
    $m("DG.Tweening.DOTweenCYInstruction.WaitForStart", function () { return {"td":$n[4].DOTweenCYInstruction,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[4].Tween],"pi":[{"n":"tween","pt":$n[4].Tween,"ps":0}],"sn":"ctor"},{"ov":true,"a":2,"n":"keepWaiting","t":16,"rt":$n[0].Boolean,"g":{"ov":true,"a":2,"n":"get_keepWaiting","t":8,"rt":$n[0].Boolean,"fg":"keepWaiting","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"keepWaiting"},{"a":1,"n":"t","t":4,"rt":$n[4].Tween,"sn":"t","ro":true}]}; }, $n);
    /*DG.Tweening.DOTweenCYInstruction+WaitForStart end.*/

    /*DG.Tweening.DOTweenModuleUtils start.*/
    $m("DG.Tweening.DOTweenModuleUtils", function () { return {"nested":[$n[4].DOTweenModuleUtils.Physics],"att":1048961,"a":2,"s":true,"m":[{"at":[new UnityEngine.Scripting.PreserveAttribute()],"a":2,"n":"Init","is":true,"t":8,"sn":"Init","rt":$n[0].Void},{"at":[new UnityEngine.Scripting.PreserveAttribute()],"a":1,"n":"Preserver","is":true,"t":8,"sn":"Preserver","rt":$n[0].Void},{"a":1,"n":"_initialized","is":true,"t":4,"rt":$n[0].Boolean,"sn":"_initialized","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*DG.Tweening.DOTweenModuleUtils end.*/

    /*DG.Tweening.DOTweenModuleUtils+Physics start.*/
    $m("DG.Tweening.DOTweenModuleUtils.Physics", function () { return {"td":$n[4].DOTweenModuleUtils,"att":1048962,"a":2,"s":true,"m":[{"at":[new UnityEngine.Scripting.PreserveAttribute()],"a":2,"n":"CreateDOTweenPathTween","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].MonoBehaviour,"ps":0},{"n":"tweenRigidbody","pt":$n[0].Boolean,"ps":1},{"n":"isLocal","pt":$n[0].Boolean,"ps":2},{"n":"path","pt":$n[8].Path,"ps":3},{"n":"duration","pt":$n[0].Single,"ps":4},{"n":"pathMode","pt":$n[4].PathMode,"ps":5}],"sn":"CreateDOTweenPathTween","rt":$n[7].TweenerCore$3(UnityEngine.Vector3,DG.Tweening.Plugins.Core.PathCore.Path,DG.Tweening.Plugins.Options.PathOptions),"p":[$n[2].MonoBehaviour,$n[0].Boolean,$n[0].Boolean,$n[8].Path,$n[0].Single,$n[4].PathMode]},{"at":[new UnityEngine.Scripting.PreserveAttribute()],"a":2,"n":"HasRigidbody","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Component,"ps":0}],"sn":"HasRigidbody","rt":$n[0].Boolean,"p":[$n[2].Component],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"HasRigidbody2D","is":true,"t":8,"pi":[{"n":"target","pt":$n[2].Component,"ps":0}],"sn":"HasRigidbody2D","rt":$n[0].Boolean,"p":[$n[2].Component],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"SetOrientationOnPath","is":true,"t":8,"pi":[{"n":"options","pt":$n[10].PathOptions,"ps":0},{"n":"t","pt":$n[4].Tween,"ps":1},{"n":"newRot","pt":$n[2].Quaternion,"ps":2},{"n":"trans","pt":$n[2].Transform,"ps":3}],"sn":"SetOrientationOnPath","rt":$n[0].Void,"p":[$n[10].PathOptions,$n[4].Tween,$n[2].Quaternion,$n[2].Transform]}]}; }, $n);
    /*DG.Tweening.DOTweenModuleUtils+Physics end.*/

    /*Core.Services.IAudioService start.*/
    $m("Core.Services.IAudioService", function () { return {"att":1048737,"a":2,"m":[{"ab":true,"a":2,"n":"PlayMusic","t":8,"pi":[{"n":"key","pt":$n[0].String,"ps":0},{"n":"fadeDuration","dv":1.0,"o":true,"pt":$n[0].Single,"ps":1}],"sn":"Core$Services$IAudioService$PlayMusic","rt":$n[0].Void,"p":[$n[0].String,$n[0].Single]},{"ab":true,"a":2,"n":"PlaySFX","t":8,"pi":[{"n":"key","pt":$n[0].String,"ps":0},{"n":"position","dv":null,"o":true,"pt":$n[0].Nullable$1(UnityEngine.Vector3),"ps":1},{"n":"pitch","dv":1.0,"o":true,"pt":$n[0].Single,"ps":2}],"sn":"Core$Services$IAudioService$PlaySFX","rt":$n[0].Void,"p":[$n[0].String,$n[0].Nullable$1(UnityEngine.Vector3),$n[0].Single]},{"ab":true,"a":2,"n":"SetMusicVolume","t":8,"pi":[{"n":"volume","pt":$n[0].Single,"ps":0}],"sn":"Core$Services$IAudioService$SetMusicVolume","rt":$n[0].Void,"p":[$n[0].Single]},{"ab":true,"a":2,"n":"SetSFXVolume","t":8,"pi":[{"n":"volume","pt":$n[0].Single,"ps":0}],"sn":"Core$Services$IAudioService$SetSFXVolume","rt":$n[0].Void,"p":[$n[0].Single]},{"ab":true,"a":2,"n":"StopMusic","t":8,"pi":[{"n":"fadeDuration","dv":1.0,"o":true,"pt":$n[0].Single,"ps":0}],"sn":"Core$Services$IAudioService$StopMusic","rt":$n[0].Void,"p":[$n[0].Single]}]}; }, $n);
    /*Core.Services.IAudioService end.*/

    /*Core.Services.ServicesLocator start.*/
    $m("Core.Services.ServicesLocator", function () { return {"att":1048961,"a":2,"s":true,"m":[{"a":2,"n":"ClearAll","is":true,"t":8,"sn":"ClearAll","rt":$n[0].Void},{"a":2,"n":"Get","is":true,"t":8,"tpc":1,"tprm":["T"],"sn":"Get","rt":System.Object},{"a":2,"n":"Register","is":true,"t":8,"pi":[{"n":"service","pt":System.Object,"ps":0}],"tpc":1,"tprm":["T"],"sn":"Register","rt":$n[0].Void,"p":[System.Object]},{"a":2,"n":"Unregister","is":true,"t":8,"tpc":1,"tprm":["T"],"sn":"Unregister","rt":$n[0].Void},{"a":1,"n":"_services","is":true,"t":4,"rt":$n[1].Dictionary$2(System.Type,System.Object),"sn":"_services","ro":true}]}; }, $n);
    /*Core.Services.ServicesLocator end.*/

    }});
