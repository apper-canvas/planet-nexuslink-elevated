import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';
import { HexColorPicker } from 'react-colorful';
import { themeColors, fontOptions, borderRadiusOptions } from '../../utils/settingsUtils';

const ThemeSettings = ({ settings, setSettings, darkMode }) => {
  const [themeSettings, setThemeSettings] = useState({ ...settings.theme });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Icons
  const PaletteIcon = getIcon('palette');
  const SunIcon = getIcon('sun');
  const MoonIcon = getIcon('moon');
  const MonitorIcon = getIcon('monitor');
  const TypeIcon = getIcon('type');
  const SquareIcon = getIcon('square');
  const ZapIcon = getIcon('zap');
  const EyeIcon = getIcon('eye');
  const SaveIcon = getIcon('save');
  const RefreshIcon = getIcon('refresh-cw');

  // Update theme mode in real-time for preview
  useEffect(() => {
    // This is just for preview purposes - doesn't actually change the app's theme
    const previewEl = document.getElementById('theme-preview');
    if (!previewEl) return;
    
    if (themeSettings.mode === 'dark' || 
        (themeSettings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      previewEl.classList.add('dark-preview');
    } else {
      previewEl.classList.remove('dark-preview');
    }

    // Apply primary color to preview
    document.documentElement.style.setProperty('--preview-primary-color', themeSettings.primaryColor);
    document.documentElement.style.setProperty('--preview-accent-color', themeSettings.accentColor);
    
    return () => {
      // Clean up custom properties
      document.documentElement.style.removeProperty('--preview-primary-color');
      document.documentElement.style.removeProperty('--preview-accent-color');
    };
  }, [themeSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setThemeSettings({
      ...themeSettings,
      [name]: value
    });
  };

  const handleColorChange = (color) => {
    if (selectedColorType === 'primary') {
      setThemeSettings({
        ...themeSettings,
        primaryColor: color
      });
    } else if (selectedColorType === 'accent') {
      setThemeSettings({
        ...themeSettings,
        accentColor: color
      });
    }
  };

  const openColorPicker = (type) => {
    setSelectedColorType(type);
    setShowColorPicker(true);
  };

  const closeColorPicker = () => {
    setShowColorPicker(false);
    setSelectedColorType(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = updateSettings('theme', themeSettings);
      setSettings(updatedSettings);
      toast.success('Theme settings saved successfully');
      
      // If theme mode was changed, prompt user to reload to see changes
      if (themeSettings.mode === 'dark' && !darkMode || themeSettings.mode === 'light' && darkMode) {
        toast.info('Please refresh the page to apply theme changes', {
          autoClose: false,
          closeButton: true
        });
      }
    } catch (error) {
      toast.error('Failed to save theme settings');
      console.error('Error saving theme settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setThemeSettings({
      mode: 'system',
      primaryColor: '#3b82f6',
      accentColor: '#f43f5e',
      customFont: 'Inter',
      borderRadius: 'medium',
      animations: true
    });
    toast.info('Theme settings reset to defaults');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="settings-card">
          <h2 className="settings-section-title flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" /> Theme Settings
          </h2>
          
          <div className="space-y-6">
            {/* Theme Mode */}
            <div>
              <h3 className="font-medium mb-3">Theme Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'mode', value: 'light' } })}
                  className={`p-4 rounded-lg border ${
                    themeSettings.mode === 'light' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  } flex flex-col items-center gap-2`}
                >
                  <SunIcon className="w-6 h-6" />
                  <span>Light</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'mode', value: 'dark' } })}
                  className={`p-4 rounded-lg border ${
                    themeSettings.mode === 'dark' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  } flex flex-col items-center gap-2`}
                >
                  <MoonIcon className="w-6 h-6" />
                  <span>Dark</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'mode', value: 'system' } })}
                  className={`p-4 rounded-lg border ${
                    themeSettings.mode === 'system' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  } flex flex-col items-center gap-2`}
                >
                  <MonitorIcon className="w-6 h-6" />
                  <span>System</span>
                </button>
              </div>
            </div>
            
            {/* Colors */}
            <div>
              <h3 className="font-medium mb-3">Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {themeColors.slice(0, 5).map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-swatch ${themeSettings.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        onClick={() => handleInputChange({ target: { name: 'primaryColor', value: color.value } })}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {themeColors.slice(5).map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-swatch ${themeSettings.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        onClick={() => handleInputChange({ target: { name: 'primaryColor', value: color.value } })}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => openColorPicker('primary')}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <span>Custom color</span>
                    <div 
                      className="w-4 h-4 rounded-full inline-block border border-surface-200 dark:border-surface-600" 
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {themeColors.slice(0, 5).map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-swatch ${themeSettings.accentColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        onClick={() => handleInputChange({ target: { name: 'accentColor', value: color.value } })}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {themeColors.slice(5).map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`color-swatch ${themeSettings.accentColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        onClick={() => handleInputChange({ target: { name: 'accentColor', value: color.value } })}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => openColorPicker('accent')}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <span>Custom color</span>
                    <div 
                      className="w-4 h-4 rounded-full inline-block border border-surface-200 dark:border-surface-600" 
                      style={{ backgroundColor: themeSettings.accentColor }}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Font and Border Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <TypeIcon className="w-4 h-4" /> Font Family
                </label>
                <select 
                  name="customFont" 
                  value={themeSettings.customFont || 'Inter'} 
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {fontOptions.map(font => (
                    <option key={font.value} value={font.value}>{font.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <SquareIcon className="w-4 h-4" /> Border Radius
                </label>
                <select 
                  name="borderRadius" 
                  value={themeSettings.borderRadius || 'medium'} 
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {borderRadiusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <ZapIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Enable Animations</div>
                  <div className="text-sm text-surface-500 dark:text-surface-400">
                    Toggle animations and transitions throughout the interface
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input 
                  type="checkbox" 
                  name="animations" 
                  checked={themeSettings.animations} 
                  onChange={(e) => handleInputChange({ 
                    target: { name: 'animations', value: e.target.checked } 
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-300 dark:bg-surface-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="pt-4 flex justify-between">
              <button 
                type="button" 
                onClick={resetToDefaults}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshIcon className="w-4 h-4" />
                Reset to Defaults
              </button>
              
              <button 
                type="button" 
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    Save Theme Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Theme Preview */}
      <div className="lg:col-span-1">
        <div className="settings-card sticky top-24">
          <h2 className="settings-section-title flex items-center gap-2">
            <EyeIcon className="w-5 h-5" /> Preview
          </h2>
          
          <div 
            id="theme-preview" 
            className={`border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden`}
            style={{ '--primary-preview': themeSettings.primaryColor, '--accent-preview': themeSettings.accentColor }}
          >
            <div className="border-b border-surface-200 dark:border-surface-700 p-3 bg-white dark:bg-surface-800">
              <div className="flex items-center justify-between">
                <div className="font-bold" style={{ color: themeSettings.primaryColor }}>NexusLink</div>
                <button 
                  className="p-1.5 rounded-full" 
                  style={{ backgroundColor: themeSettings.primaryColor + '20', color: themeSettings.primaryColor }}
                >
                  <MoonIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-surface-50 dark:bg-surface-900">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <div className="font-medium">Sample Card Title</div>
                  <div className="text-sm text-surface-500 dark:text-surface-400">Sample description text</div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1.5 rounded-lg text-sm font-medium" 
                    style={{ backgroundColor: themeSettings.primaryColor, color: '#ffffff' }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                  >
                    Secondary Button
                  </button>
                </div>
                
                <div className="p-3 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <div 
                    className="w-full h-2 rounded-full" 
                    style={{ backgroundColor: themeSettings.primaryColor + '30' }}
                  >
                    <div 
                      className="h-2 rounded-full" 
                      style={{ width: '70%', backgroundColor: themeSettings.primaryColor }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium" 
                    style={{ backgroundColor: themeSettings.accentColor + '20', color: themeSettings.accentColor }}
                  >
                    Sample Tag
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium" 
                    style={{ backgroundColor: themeSettings.primaryColor + '20', color: themeSettings.primaryColor }}
                  >
                    Another Tag
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-surface-500 dark:text-surface-400">
            <p>This preview shows how your theme settings will appear in the application.</p>
          </div>
        </div>
      </div>
      
      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50">
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Choose a {selectedColorType === 'primary' ? 'Primary' : 'Accent'} Color
            </h3>
            
            <div className="mb-4">
              <HexColorPicker 
                color={selectedColorType === 'primary' ? themeSettings.primaryColor : themeSettings.accentColor} 
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center mb-4">
              <span className="font-medium mr-2">Selected color:</span>
              <div 
                className="w-8 h-8 rounded-md border border-surface-200 dark:border-surface-600 mr-2" 
                style={{ backgroundColor: selectedColorType === 'primary' ? themeSettings.primaryColor : themeSettings.accentColor }}
              ></div>
              <input 
                type="text" 
                value={selectedColorType === 'primary' ? themeSettings.primaryColor : themeSettings.accentColor} 
                onChange={(e) => handleColorChange(e.target.value)}
                className="input-field max-w-[120px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={closeColorPicker}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={closeColorPicker}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;