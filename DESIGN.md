---
status: canonical
owner: design
last_reviewed: 2026-05-21
source_paths:
  - src/app/globals.css
  - src/features/game/components/ModalLayer.tsx
  - src/shared/ui/window/WindowFrame.tsx
  - src/widgets/hud/ui/components/GoldDisplay.tsx
external_references:
  - https://github.com/VoltAgent/awesome-design-md
  - https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/nvidia/DESIGN.md
  - https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/warp/DESIGN.md
---

# Drilling RPG Design System

이 문서는 Drilling RPG의 UI, HUD, 모달, 메뉴, 상점, 인벤토리, 설정 화면을 판단하는 시각 디자인 정본입니다. 새 UI를 만들거나 기존 UI를 수정할 때는 이 문서를 먼저 읽고, 실제 구현은 `src/app/globals.css`의 pixel primitive와 각 위젯의 현재 구조를 기준으로 검증합니다.

외부 참고 자료는 `awesome-design-md`의 형식과 일부 원칙만 차용합니다. Drilling RPG는 SaaS, 문서 앱, 콘솔 랜딩 페이지가 아니라 웹 브라우저에서 플레이하는 2D 픽셀 채굴 RPG입니다. 따라서 최종 판단 기준은 브랜드 모방이 아니라 플레이 중인 게임 화면과의 일체감입니다.

## Visual Direction

Drilling RPG의 UI는 dark pixel mining RPG interface입니다. 단순한 다크 모드가 아니라, 지하 광산의 현무암, 흑철, 산화된 금속, 광석 하이라이트가 섞인 픽셀 아트 UI여야 합니다. 목재와 가죽은 대장간이나 상점의 작은 보조 재료로만 쓰고, 전체 화면의 기본 질량이 갈색 목재판처럼 보이면 실패입니다.

핵심 인상:

- top-down 2D pixel mining RPG
- dark mine, basalt stone, blackened metal, chipped ore edge, ore glow
- compact HUD, chunky windows, low-radius pixel edges
- warm ink text over dark material surfaces
- cyan/green/gold accents for action, success, currency, selection

피해야 할 인상:

- generic dark mode dashboard
- glassmorphism or blurred premium app shell
- bright parchment spreadsheet
- brown wood-menu skin as the dominant UI mass
- SaaS admin panel
- mobile app settings screen
- marketing landing page hero composition inside gameplay

## Reference Stance

`NVIDIA DESIGN.md`에서 가져올 만한 것은 각진 형태, 낮은 radius, 강한 edge, 제한된 highlight 사용입니다. 색, 브랜드 톤, tech-product mood는 사용하지 않습니다.

`Warp DESIGN.md`에서 가져올 만한 것은 어두운 작업 표면, 밀도 있는 정보 배열, 절제된 motion입니다. terminal/devtool mood는 사용하지 않습니다.

`PlayStation DESIGN.md` 계열의 큰 이미지, pill button, marketing page hierarchy는 인게임 UI 기준으로 사용하지 않습니다.

## Palette

현재 UI의 기준 토큰은 `src/app/globals.css`의 `:root`에 정의합니다.

| Token | Value | Usage |
|---|---:|---|
| `--pixel-bg-deep` | `#090a08` | overlay, deepest mine shadow |
| `--pixel-bg` | `#22251f` | default basalt/iron body |
| `--pixel-bg-raised` | `#30352d` | raised frame, title band |
| `--pixel-surface` | `#2b3029` | cards and inner panels |
| `--pixel-surface-muted` | `#242a24` | disabled/secondary panels |
| `--pixel-border` | `#3c453c` | chipped stone/iron border |
| `--pixel-border-dark` | `#050604` | outer pixel outline |
| `--pixel-ink` | `#f4dfb8` | primary text |
| `--pixel-ink-soft` | `#d0b886` | secondary text |
| `--pixel-ink-dim` | `#a89065` | tertiary text and compact metadata |
| `--pixel-ink-disabled` | `#7d6648` | disabled labels |
| `--pixel-highlight` | `#d8a84f` | selection, currency, strong focus |
| `--pixel-cyan` | `#2c8f87` | active tabs, forge/action affordance |
| `--pixel-green` | `#4f9b5f` | success, positive stats |
| `--pixel-red` | `#b84a3c` | danger, destructive actions |

Color rules:

- Use basalt, coal, and blackened iron as the default UI mass.
- Use cyan or gold only for selected, actionable, or high-value states.
- Keep large surfaces mid-dark. Do not flood modals with bright yellow, parchment, beige, cream, slate, purple, pure black, or dominant brown.
- Never rely on `zinc`, `slate`, or generic grayscale as the dominant UI language.
- Text must remain readable over gameplay and UI textures.

## Typography

The game UI default language is English. Korean may appear in developer docs, comments, and internal planning, but runtime labels, modal copy, item UI, HUD text, buttons, and toasts should be English unless localization is explicitly implemented.

Typography rules:

- Use `pixel-font` for game UI surfaces.
- Use short labels: `Equipment`, `Effects`, `Craft`, `Sell`, `Close`, `Owned`.
- Avoid italic and Tailwind `uppercase`; project rules forbid these classes.
- Do not use negative letter spacing.
- Do not scale font size with viewport width.
- Use large display text only for actual titles. Dense panels should use compact text.

## Shape And Materials

The base primitives are:

- `pixel-frame`: full window shell, modal root, large menu surface
- `pixel-panel`: strong inner section
- `pixel-card`: repeated item/card surface
- `pixel-icon-box`: icon cell or item sprite socket
- `pixel-button`: normal command
- `pixel-button-active`: selected tab/filter/state
- `pixel-button-success`: positive action
- `pixel-button-danger`: destructive action
- `pixel-button-action`: primary forge/action button
- `pixel-badge`: compact HUD value or status chip
- `pixel-bar`: progress, health, mastery, cooldown

Shape rules:

- Default radius is `3px`.
- Use 2px borders plus dark outer outlines.
- Shadows must read as pixel offsets, not soft modern elevation.
- Inset highlights can suggest chipped stone, worn iron, or ore seams.
- Avoid rounded pills, glass panels, blurred backdrops, oversized soft shadows, and floating cards.

## HUD

The normal playfield must stay readable. Persistent HUD should sit at edges and use compact clusters.

HUD priority:

1. survival and combat state
2. currency and short progression counters
3. contextual prompts
4. navigation or secondary tools

HUD rules:

- Keep the center and lower-middle playfield clear during normal movement.
- Use small `pixel-badge` and `pixel-bar` surfaces instead of large panels.
- Do not stack multiple equal-weight boxes around every edge.
- Mobile HUD must collapse before it covers the playfield.
- Icons should come from existing atlas assets when available.

## Windows And Modals

Large menus such as shop, inventory, crafting, status, elevator, encyclopedia, settings, and guide use game-world windows, not web app panels.

Window rules:

- Use `pixel-frame` for the outer shell.
- Use `pixel-panel` for major internal regions.
- Use `pixel-card` only for repeated selectable items or compact data blocks.
- Preserve a clear title/header band, but do not make it a modern nav bar.
- Use a dim mine overlay such as `#090a08` with transparency behind modal windows.
- Desktop windows should feel substantial but not cover the entire browser chrome.
- Avoid bright parchment, spreadsheet grids, white/yellow document backgrounds, and huge empty cards.

## Controls

Buttons and controls must look pressable inside the pixel material system.

Control rules:

- Selected state uses cyan body plus gold border.
- Disabled state uses muted basalt-green surfaces with clear opacity reduction.
- Destructive actions use red material and short copy.
- Primary actions may use cyan or green, depending on meaning.
- Hover/focus should change border or surface color, not scale the whole element.
- Icon buttons should use known symbols when possible.

## Inventory, Crafting, And Shop

These screens are workbench surfaces inside the game world.

Rules:

- Item rows should feel like inventory trays, not table rows.
- Empty states use `pixel-empty`, not blank modern cards.
- Sprite/icon sockets use `pixel-icon-box`.
- Selection detail panels should be visually heavier than list items.
- Currency, ownership, stack counts, and requirements must be scannable within one glance.
- Do not use product-card commerce layouts or SaaS settings layouts.

## Motion

Motion should support state change and reward feedback.

Allowed:

- short fade-in for overlays
- tiny state flash for selection, reward, or danger
- progress bar change
- limited rune or reward effects

Avoid:

- constant hover scaling
- springy mobile-app motion
- large modal bounces
- animation that competes with combat or movement

Respect reduced-motion preferences for non-essential effects.

## Responsive Rules

Desktop:

- Keep modal content within readable bounds.
- Prefer two-column detail layouts only when both columns have enough content.
- Avoid empty right panels that look like placeholder management software.

Mobile:

- Use full-height windows when needed, but keep controls reachable.
- Collapse filters and secondary panels before shrinking text too far.
- Ensure text fits its button or panel without overlap.

## Anti-Patterns

Do not introduce:

- `backdrop-blur` or glassmorphism
- large `rounded-*` radii beyond pixel primitive defaults
- `shadow-2xl` style soft elevation
- bright parchment/yellow full-window surfaces
- brown wood/leather full-window surfaces
- generic dark slate dashboards
- purple/blue gradient SaaS styling
- landing-page hero layouts inside gameplay
- nested cards inside cards
- invisible disabled states
- runtime Korean copy mixed into English UI

## 10/10 Review Gate

A UI change can be considered 10/10 for the current art direction only when all checks pass:

- It reads as a 2D pixel RPG screen before reading any text.
- It uses the shared pixel primitives or clearly matches them.
- It protects the playable center during normal gameplay.
- It is dark mine themed, not generic dark mode.
- It avoids parchment, glass, SaaS, and mobile app styling.
- It keeps English as runtime UI language.
- It has clear selected, disabled, hover, focus, success, danger, and empty states where applicable.
- It works on desktop and mobile without text overlap.
- It does not add unrelated visual systems or one-off palettes.
- It passes `npx tsc --noEmit`, `npm run lint`, and a visual smoke review for the touched screens.

## Agent Prompt

When asking an AI agent to modify UI in this project, include this instruction:

```text
Follow DESIGN.md. The target is a dark 2D pixel mining RPG interface with basalt stone, blackened metal, chipped ore edges, and restrained cyan/gold ore accents. Use existing pixel primitives from src/app/globals.css. Avoid parchment, glassmorphism, rounded modern cards, SaaS dashboards, brown wood-menu skins, and runtime Korean copy.
```
