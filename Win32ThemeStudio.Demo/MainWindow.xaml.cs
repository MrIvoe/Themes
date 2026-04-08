using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Win32ThemeStudio.Themes;

namespace Win32ThemeStudio.Demo;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    private readonly IReadOnlyList<ThemeDescriptor> availableThemes;

    public MainWindow()
    {
        InitializeComponent();

        availableThemes = ThemeManager.AvailableThemeDescriptors
            .OrderBy(static theme => theme.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        ThemeComboBox.ItemsSource = availableThemes;
        ThemeComboBox.SelectedItem = ThemeCatalog.DefaultLightTheme;

        Opacity = OpacitySlider.Value;
        OpacityLabel.Text = $"{(int)(Opacity * 100)}%";
    }

    private void ThemeComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ThemeComboBox.SelectedItem is not ThemeDescriptor selectedTheme)
        {
            return;
        }

        ThemeManager.ApplyTheme(selectedTheme);
        ApplyPresetBackground(ThemePresetSerializer.ExportTheme(selectedTheme.Id));
        if (TransparentToggle.IsChecked != true)
        {
            Background = (Brush)Application.Current.Resources[ThemePaletteKeys.WindowGlass];
        }
    }

    private void TransparentToggle_Changed(object sender, RoutedEventArgs e)
    {
        if (TransparentToggle.IsChecked == true)
        {
            Background = Brushes.Transparent;
            return;
        }

        Background = (Brush)Application.Current.Resources[ThemePaletteKeys.WindowGlass];
    }

    private void OpacitySlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        Opacity = OpacitySlider.Value;
        if (OpacityLabel is not null)
        {
            OpacityLabel.Text = $"{(int)(Opacity * 100)}%";
        }
    }

    private void ApplyPresetBackground(ThemePreset preset)
    {
        if (preset.Background is null)
        {
            RootDockPanel.SetResourceReference(DockPanel.BackgroundProperty, ThemePaletteKeys.Background);
            return;
        }

        var fallbackColor = preset.PaletteValues.TryGetValue(ThemePaletteKeys.Background, out var paletteBackground)
            ? paletteBackground
            : "#FF202124";

        RootDockPanel.Background = ThemePresetBackgroundBrushFactory.CreateBrush(preset.Background, fallbackColor);
    }
}