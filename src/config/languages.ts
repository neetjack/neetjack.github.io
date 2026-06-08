export const postLanguages = {
    // DefAult language to use when no specific language is detected
    default: "English",

    // Translation variant mapping dictionary (suffix -> display name)
    // Note: The keys are case-insensitive, so write them in lowercase. For example, '-en' and '-EN' will both match 'en'.
    variants: {
        "cn": "简体中文",
        "en": "English",
        "jp": "日本語",
        // You can add more languages here at any time, for example:
        // "kr": "한국어",
        // "fr": "Français"
    } as Record<string, string>
};
