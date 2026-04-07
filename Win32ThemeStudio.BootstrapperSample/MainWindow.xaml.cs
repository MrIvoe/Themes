using System.IO;
using System.Windows;
using System.Windows.Controls;
using Win32ThemeStudio.Themes;

namespace Win32ThemeStudio.BootstrapperSample;

public partial class MainWindow : Window
{
    private const string AllOption = "All";
    private readonly string samplePresetPath = Path.Combine(AppContext.BaseDirectory, "Presets", "SignalNight.json");
    private bool suppressThemeSelectionChanged;

    public MainWindow()
    {
        InitializeComponent();
        LoadFilters();
        PresetPathTextBlock.Text = $"Sample preset file: {samplePresetPath}";
        ApplyFilters(selectThemeId: ThemeCatalog.DefaultDarkThemeId);
    }

    private void LoadFilters()
    {
        AppearanceComboBox.ItemsSource = new[]
        {
            AllOption,
            ThemeAppearance.Light.ToString(),
            ThemeAppearance.Dark.ToString()
        };

        CategoryComboBox.ItemsSource = new[] { AllOption }
            .Concat(ThemeCatalog.Themes
                .Select(static theme => theme.Category)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(static category => category, StringComparer.OrdinalIgnoreCase))
            .ToArray();

        AccentFamilyComboBox.ItemsSource = new[] { AllOption }
            .Concat(ThemeCatalog.Themes
                .Select(static theme => theme.AccentFamily)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(static accentFamily => accentFamily, StringComparer.OrdinalIgnoreCase))
            .ToArray();

        AppearanceComboBox.SelectedIndex = 0;
        CategoryComboBox.SelectedIndex = 0;
        AccentFamilyComboBox.SelectedIndex = 0;
    }

    private void AppearanceComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        ApplyFilters();
    }

    private void CategoryComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        ApplyFilters();
    }

    private void AccentFamilyComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        ApplyFilters();
    }

    private void ThemeComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (suppressThemeSelectionChanged)
        {
            return;
        }

        if (ThemeComboBox.SelectedItem is not ThemeDescriptor theme)
        {
            return;
        }

        ApplyCatalogTheme(theme, ThemeComboBox.Items.Count);
    }

    private void ApplyFilters(string? selectThemeId = null)
    {
        var themes = ThemeCatalog.Themes.AsEnumerable();

        if (AppearanceComboBox.SelectedItem is string appearanceText &&
            !string.Equals(appearanceText, AllOption, StringComparison.OrdinalIgnoreCase) &&
            Enum.TryParse<ThemeAppearance>(appearanceText, out var appearance))
        {
            themes = themes.Where(theme => theme.Appearance == appearance);
        }

        if (CategoryComboBox.SelectedItem is string category &&
            !string.Equals(category, AllOption, StringComparison.OrdinalIgnoreCase))
        {
            themes = themes.Where(theme => string.Equals(theme.Category, category, StringComparison.OrdinalIgnoreCase));
        }

        if (AccentFamilyComboBox.SelectedItem is string accentFamily &&
            !string.Equals(accentFamily, AllOption, StringComparison.OrdinalIgnoreCase))
        {
            themes = themes.Where(theme => string.Equals(theme.AccentFamily, accentFamily, StringComparison.OrdinalIgnoreCase));
        }

        var filteredThemes = themes.OrderBy(static theme => theme.DisplayName, StringComparer.OrdinalIgnoreCase).ToArray();
        ThemeComboBox.ItemsSource = filteredThemes;

        var selectedTheme = filteredThemes.FirstOrDefault(theme => string.Equals(theme.Id, selectThemeId, StringComparison.OrdinalIgnoreCase))
            ?? filteredThemes.FirstOrDefault();

        suppressThemeSelectionChanged = true;
        ThemeComboBox.SelectedItem = selectedTheme;
        suppressThemeSelectionChanged = false;
        FilterResultTextBlock.Text = $"{filteredThemes.Length} theme(s) match the current filter.";

        if (selectedTheme is not null)
        {
            ApplyCatalogTheme(selectedTheme, filteredThemes.Length);
        }
    }

    private void ApplyCatalogTheme(ThemeDescriptor theme, int filteredCount)
    {
        ThemeManager.ApplyTheme(Application.Current, theme);
        var preset = ThemePresetSerializer.ExportTheme(theme.Id);
        UpdateThemeDetails(preset, filteredCount, "Built-in catalog theme");
    }

    private void ExportThemeJsonButton_Click(object sender, RoutedEventArgs e)
    {
        if (ThemeComboBox.SelectedItem is not ThemeDescriptor theme)
        {
            return;
        }

        var preset = ThemePresetSerializer.ExportTheme(theme.Id);
        PresetJsonTextBox.Text = ThemePresetSerializer.Serialize(preset);
        PresetSourceTextBlock.Text = $"Exported JSON for built-in theme: {theme.DisplayName}";
    }

    private void ApplyJsonPresetButton_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            var preset = ThemeManager.InitializeApplicationThemeFromPresetJson(Application.Current, PresetJsonTextBox.Text);
            suppressThemeSelectionChanged = true;
            ThemeComboBox.SelectedItem = null;
            suppressThemeSelectionChanged = false;

            UpdateThemeDetails(preset, ThemeComboBox.Items.Count, "Imported JSON preset");
        }
        catch (Exception exception)
        {
            MessageBox.Show(this, exception.Message, "Invalid preset JSON", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void LoadSamplePresetButton_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            if (!File.Exists(samplePresetPath))
            {
                throw new FileNotFoundException("The sample preset file was not found.", samplePresetPath);
            }

            var preset = ThemeManager.InitializeApplicationThemeFromPresetFile(Application.Current, samplePresetPath);
            PresetJsonTextBox.Text = ThemePresetSerializer.Serialize(preset);
            suppressThemeSelectionChanged = true;
            ThemeComboBox.SelectedItem = null;
            suppressThemeSelectionChanged = false;

            UpdateThemeDetails(preset, ThemeComboBox.Items.Count, $"Loaded preset file: {samplePresetPath}");
        }
        catch (Exception exception)
        {
            MessageBox.Show(this, exception.Message, "Sample preset load failed", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void UpdateThemeDetails(ThemePreset preset, int filteredCount, string source)
    {
        var theme = preset.ToThemeDescriptor();
        ThemeSummaryTextBlock.Text = $"{theme.Appearance} / {theme.Category} / {theme.AccentFamily}";
        ThemeDescriptionTextBlock.Text = theme.Description;
        TagsListBox.ItemsSource = theme.Tags;
        PresetJsonTextBox.Text = ThemePresetSerializer.Serialize(preset);
        PresetSourceTextBlock.Text = source;
        FilterResultTextBlock.Text = $"{filteredCount} theme(s) match the current filter. Active theme: {theme.DisplayName}.";
        UpdateContrastWarnings(preset);
    }

    private void UpdateContrastWarnings(ThemePreset preset)
    {
        var issues = ThemeContrastValidator.ValidatePreset(preset);
        ContrastSummaryTextBlock.Text = issues.Count == 0
            ? "No contrast warnings detected for the checked theme token pairs."
            : $"{issues.Count} contrast warning(s) detected for background, surface, menu, tooltip, accent, danger, and success pairs.";

        ContrastWarningsListBox.ItemsSource = issues.Count == 0
            ? new[] { "No issues detected." }
            : issues.Select(static issue => issue.ToString()).ToArray();
    }
}