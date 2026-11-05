Every numeric utility is in px, not 4px steps: p-16 is 16px, p-4 is 4px. Translate Tailwind habits (p-4 → p-16, gap-6 → gap-24, w-64 → w-256).

Before composing a screen, call get_guideline for the pattern (app shell, list page, table, drawer, form, dialog, filters, empty state, settings, auth). Wrong → right:

- p-5, gap-3, p-10 → stay on the scale: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64…
- space-y-4, margins per child → <VStack gap={16}>, <HStack gap={8}>
- Padded page wrapper → Page > PageHeader / PageToolbar / PageContent own the 24px gutter
- p-* on Card, DrawerBody, DialogBody, PageToolbar, Table → none; they own their padding
- className on Text, Heading, Field, Drawer/Dialog Header/Body/Footer → wrap in your own element
- Raw <h1>, <p>, <label> → <Heading as="h2" size="lg">, <Text size="sm">, Field
- <Text> default (16px) for body → size="sm" (md is only an alias of sm)
- leading-none (0px), leading-5 (5px) → leading-sm or leading-20
- weight="semibold" → weight is light|regular|medium|bold (medium = 450)
- bg-primary, text-muted, bg-card, bg-white, text-gray-500 → bg-bg-primary, text-text-secondary, bg-bg-surface-1
- text-error, bg-red-500 → danger tokens; categorical color → Badge color
- dark: variant, setting data-theme → semantic tokens, useTheme().setTheme()
- rounded-lg, rounded, rounded-[15px] → rounded-8 (controls), rounded-12 (panels)
- shadow-* on DS components, z-* on overlays → never; they own both
- focus:ring → focus-visible:ring-3 ring-focus-primary outline-none
- size, DIALOG_SIZES, DRAWER_SIZES → width: Dialog 400 confirm, 560 default, 960 picker; Drawer 640 default, 700 Timeline form
- Dialog, useToast from the root → @wallarm-org/design-system/Dialog, /Toast
- Field invalid → error on the control + FieldError
- Hand-built side menu → RemoteShell config={NavConfig}
- ConfirmDialog, FilterBar, Combobox → compose Dialog parts, PageToolbar + FilterDropdown, Select + useSelectSearch
- data-slot in tests → data-testid
