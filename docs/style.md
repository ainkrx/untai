# Style

How the app looks: which components are on screen, where they sit, and what they look like. Only for what has been built. Rules and flows are in `docs/app-flow.md`; what has been built is in `docs/progress.md`.

## Navbar

- **Hamburger menu (every screen size):** opens a `sheet` from the left: About first, then Add Pattern. Its buttons and the Category button look the same: filled, full width in the sheet.
- **Category dropdown:** the 14 categories in two columns. On desktop it closes on a click outside it or on a category, so it never sits under the theme or profile dropdown.
- **Theme:** Light, Dark, System. On desktop, a button left of the profile icon whose icon shows the active theme (sun, moon, monitor); it opens a dropdown with the three icons in one row. On mobile, a "Theme" label in the sheet with the three as icon plus text buttons in one row. The active one is filled purple.
- **Profile dropdown:** opens from the profile icon. Logged in: My patterns, My reviews, Settings, Logout. Guest: Login, Register.
- **Desktop:** one row: hamburger icon, logo, search bar, Category dropdown, theme button, profile icon at the far right. The search bar and Category line up with the content column (48rem, centered). The search bar has a Search button on its right.
- **Mobile:** one row: hamburger icon, logo, profile icon at the far right. The search bar and Category move to the top of the sheet. There, Category opens in place in two columns and pushes the rest down. The theme choice sits below every menu item in the sheet.

## Toast

- **Box:** white (`popover`) with a thin purple border, text in the theme text colors.
- **Icon colors:** success green, info blue, warning amber, error red (`destructive`).

## Colors

Soft purple and yellow. The values are in `app/globals.css`: `:root` for light, `.dark` for dark.

Light:

- **Purple:** `primary` (buttons: Search, Category, About, Add Pattern), light lavender with dark purple text. On hover the button gets darker (12% of the text color mixed in), since a pale button that only fades on hover shows no change. `muted`, `border`, `input` and `ring` are lighter tints of the same purple.
- **Yellow:** `accent` (hover on categories and dropdown items, the profile icon), pastel with dark brown text. `secondary` (search bar) is a paler yellow with the same text color.
- **Background:** pale purple, darker than the white navbar so the two stand apart. `card` and `popover` (navbar, dropdowns) stay pure white.
- **Text:** dark purple gray instead of black.
