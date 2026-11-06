# Comparison checklist

Baseline: main @ ccb8e2b210a432272e0e4147a64b163484c4aa70. Original is authoritative where historical text differs.

| Area | Implementation / code evidence | Required review |
| --- | --- | --- |
| Authored content | Exact three levels, 3/4/5 bands, 12 outer/6 inner lanes, original counts, offsets and palettes | User visual review of all cylinders |
| Matching | Native Lua replay matches actual original methods for every action; two and three objectives reached | Headed runtime replay PASS in both orientations |
| Drag/snap | Vertical band rotation, ±2.5 clamp, original signed rounding and snap times | Portrait/landscape real-pointer assertions PASS |
| Empty lanes | Cleared source lanes remain attached to their band through future rotations | Covered by source-method differential replay |
| Inner cylinders | Fixed cosmetic positions and original palettes; no input | User visual review |
| Camera/progression | Overview tap, first focus, unlock delay/pan, third tap, overview/endcard sequence | Headed runtime replay PASS; user visual review remains |
| Coin models | Original FBX, winding/cap-UV fixes, centered original scale and base/spin rotations | User visual review of numbers, surfaces and depth |
| Lighting | Original light direction, ambient/directional intensities, FBX Phong material/specular and inactive tint; native 2048px shadow map | Shader/program assertions PASS; user visual review remains |
| Clearing/jar | Original concurrent lanes, reverse band/stack order, pop/flight/fill timing, persistent deterministic jar fill and jar appearance/exit | Code timelines and user motion review |
| UI/tutorial | Original images and copy, background cover, locks, tutorial hint and responsive layout | User visual review; no screenshots generated |
| Audio | Original audio converted to supported Vorbis, original gains, first-gesture unlock, host volume and pause | Code assertions plus user listening on devices |
| Endcard | Original icon/backdrop, camera exit, fade and auto CTA; loopback suppresses navigation | Headed runtime, resize and single local CTA assertions PASS |
| Mobile/network delivery | Local HTML5 build only | Physical-device performance/audio and external network packaging/submission unverified |

No visual equivalence or mobile performance claim is made from code checks. Source COLLAB.md reserves visual testing to the user. Any observed mismatch belongs here and must be fixed before declaring client acceptance.

Final local delivery: runtime commit bf93e5a53942d0580ebe352c7c5444f0dd9a55bb. See QA.md for the completed assertions, artifact identity and remaining manual review.
