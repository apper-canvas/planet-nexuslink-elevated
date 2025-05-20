import { useState } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';

const CrmSettings = ({ settings, setSettings }) => {
  const [crmSettings, setCrmSettings] = useState({ ...settings.crm });
  const [isEditing, setIsEditing] = useState({
    pipelines: false,
    customFields: false,
    tags: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState(crmSettings.pipelines[0] || null);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldEntity, setNewFieldEntity] = useState('contact');

  // Icons
  const DatabaseIcon = getIcon('database');
  const LayersIcon = getIcon('layers');
  const ListIcon = getIcon('list');
  const TagIcon = getIcon('tag');
  const EditIcon = getIcon('edit-2');
  const SaveIcon = getIcon('save');
  const PlusIcon = getIcon('plus');
  const TrashIcon = getIcon('trash-2');
  const CheckIcon = getIcon('check');
  const XIcon = getIcon('x');

  const toggleEditing = (section) => {
    setIsEditing({
      ...isEditing,
      [section]: !isEditing[section]
    });
  };

  const handleSaveCrmSettings = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = updateSettings('crm', crmSettings);
      setSettings(updatedSettings);
      toast.success('CRM settings saved successfully');
      setIsEditing({
        pipelines: false,
        customFields: false,
        tags: false
      });
    } catch (error) {
      toast.error('Failed to save CRM settings');
      console.error('Error saving CRM settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewPipeline = () => {
    if (!newPipelineName.trim()) {
      toast.error('Pipeline name cannot be empty');
      return;
    }

    // Check for duplicate pipeline name
    if (crmSettings.pipelines.some(p => p.name.toLowerCase() === newPipelineName.trim().toLowerCase())) {
      toast.error('A pipeline with this name already exists');
      return;
    }

    const newPipeline = {
      id: `pipeline_${Date.now()}`,
      name: newPipelineName.trim(),
      stages: ['New', 'In Progress', 'Completed']
    };

    setCrmSettings({
      ...crmSettings,
      pipelines: [...crmSettings.pipelines, newPipeline]
    });

    setNewPipelineName('');
    setCurrentPipeline(newPipeline);
    toast.success(`Pipeline "${newPipeline.name}" created`);
  };

  const selectPipeline = (pipeline) => {
    setCurrentPipeline(pipeline);
  };

  const addStage = () => {
    if (!currentPipeline) return;
    if (!newStageName.trim()) {
      toast.error('Stage name cannot be empty');
      return;
    }

    // Check for duplicate stage
    if (currentPipeline.stages.some(s => s.toLowerCase() === newStageName.trim().toLowerCase())) {
      toast.error('This stage already exists in this pipeline');
      return;
    }

    const updatedPipelines = crmSettings.pipelines.map(p => {
      if (p.id === currentPipeline.id) {
        return {
          ...p,
          stages: [...p.stages, newStageName.trim()]
        };
      }
      return p;
    });

    setCrmSettings({
      ...crmSettings,
      pipelines: updatedPipelines
    });

    // Update current pipeline reference
    setCurrentPipeline({
      ...currentPipeline,
      stages: [...currentPipeline.stages, newStageName.trim()]
    });

    setNewStageName('');
    toast.success(`Stage "${newStageName.trim()}" added to pipeline`);
  };

  const removeStage = (stage) => {
    if (!currentPipeline) return;

    // Don't allow removing the last stage
    if (currentPipeline.stages.length <= 1) {
      toast.error('Cannot remove the last stage from a pipeline');
      return;
    }

    const updatedPipelines = crmSettings.pipelines.map(p => {
      if (p.id === currentPipeline.id) {
        return {
          ...p,
          stages: p.stages.filter(s => s !== stage)
        };
      }
      return p;
    });

    setCrmSettings({
      ...crmSettings,
      pipelines: updatedPipelines
    });

    // Update current pipeline reference
    setCurrentPipeline({
      ...currentPipeline,
      stages: currentPipeline.stages.filter(s => s !== stage)
    });

    toast.success(`Stage "${stage}" removed from pipeline`);
  };

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    // Check for duplicate tag
    if (crmSettings.tags.some(t => t.toLowerCase() === newTag.trim().toLowerCase())) {
      toast.error('This tag already exists');
      return;
    }

    setCrmSettings({
      ...crmSettings,
      tags: [...crmSettings.tags, newTag.trim()]
    });

    setNewTag('');
    toast.success(`Tag "${newTag.trim()}" added`);
  };

  const removeTag = (tag) => {
    setCrmSettings({
      ...crmSettings,
      tags: crmSettings.tags.filter(t => t !== tag)
    });

    toast.success(`Tag "${tag}" removed`);
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) {
      toast.error('Field name cannot be empty');
      return;
    }

    // Check for duplicate field
    if (crmSettings.customFields.some(
      f => f.name.toLowerCase() === newFieldName.trim().toLowerCase() && f.entity === newFieldEntity
    )) {
      toast.error(`A field with this name already exists for ${newFieldEntity}s`);
      return;
    }

    const newField = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      entity: newFieldEntity
    };

    setCrmSettings({
      ...crmSettings,
      customFields: [...crmSettings.customFields, newField]
    });

    setNewFieldName('');
    toast.success(`Custom field "${newFieldName.trim()}" added for ${newFieldEntity}s`);
  };

  const removeCustomField = (fieldId) => {
    setCrmSettings({
      ...crmSettings,
      customFields: crmSettings.customFields.filter(f => f.id !== fieldId)
    });

    toast.success('Custom field removed');
  };

  return (
    <div className="space-y-8">
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <LayersIcon className="w-5 h-5" /> Pipeline Management
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Sales Pipelines</h3>
            <button 
              type="button" 
              onClick={() => toggleEditing('pipelines')} 
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {isEditing.pipelines ? (
                <><CheckIcon className="w-4 h-4" /> Done Editing</>
              ) : (
                <><EditIcon className="w-4 h-4" /> Edit Pipelines</>
              )}
            </button>
          </div>
          
          {isEditing.pipelines && (
            <div className="bg-surface-50 dark:bg-surface-700/30 p-4 rounded-lg mb-4">
              <div className="flex gap-2 mb-4">
                <input 
                  type="text"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  placeholder="New pipeline name"
                  className="input-field flex-grow"
                />
                <button 
                  type="button" 
                  onClick={addNewPipeline}
                  className="btn-primary flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> 
                  Add Pipeline
                </button>
              </div>
              
              <div className="flex overflow-x-auto gap-2 pb-2">
                {crmSettings.pipelines.map(pipeline => (
                  <button
                    key={pipeline.id}
                    type="button"
                    onClick={() => selectPipeline(pipeline)}
                    className={`px-3 py-1.5 rounded whitespace-nowrap ${
                      currentPipeline?.id === pipeline.id ? 'bg-primary text-white' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700'
                    }`}
                  >
                    {pipeline.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentPipeline && (
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
              <div className="bg-surface-100 dark:bg-surface-700 px-4 py-2 border-b border-surface-200 dark:border-surface-700">
                <h4 className="font-medium">{currentPipeline.name} Pipeline Stages</h4>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {currentPipeline.stages.map((stage, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-white dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700"
                    >
                      <span>{stage}</span>
                      {isEditing.pipelines && (
                        <button 
                          type="button" 
                          onClick={() => removeStage(stage)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove stage"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {isEditing.pipelines && (
                  <div className="flex gap-2 mt-4">
                    <input 
                      type="text"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="New stage name"
                      className="input-field flex-grow"
                    />
                    <button 
                      type="button" 
                      onClick={addStage}
                      className="btn-primary flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" /> 
                      Add Stage
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <ListIcon className="w-5 h-5" /> Custom Fields
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Manage Custom Fields</h3>
            <button 
              type="button" 
              onClick={() => toggleEditing('customFields')} 
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {isEditing.customFields ? (
                <><CheckIcon className="w-4 h-4" /> Done Editing</>
              ) : (
                <><EditIcon className="w-4 h-4" /> Edit Fields</>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-100 dark:bg-surface-700">
                  <th className="text-left p-3 border-b border-surface-200 dark:border-surface-700">Field Name</th>
                  <th className="text-left p-3 border-b border-surface-200 dark:border-surface-700">Type</th>
                  <th className="text-left p-3 border-b border-surface-200 dark:border-surface-700">Entity</th>
                  {isEditing.customFields && (
                    <th className="text-right p-3 border-b border-surface-200 dark:border-surface-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {crmSettings.customFields.map((field) => (
                  <tr key={field.id} className="border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800">
                    <td className="p-3">{field.name}</td>
                    <td className="p-3">{field.type.charAt(0).toUpperCase() + field.type.slice(1)}</td>
                    <td className="p-3">{field.entity.charAt(0).toUpperCase() + field.entity.slice(1)}</td>
                    {isEditing.customFields && (
                      <td className="p-3 text-right">
                        <button 
                          type="button" 
                          onClick={() => removeCustomField(field.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove field"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                
                {isEditing.customFields && (
                  <tr>
                    <td className="p-3">
                      <input 
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="New field name"
                        className="input-field w-full"
                      />
                    </td>
                    <td className="p-3">
                      <select 
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="date">Date</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="url">URL</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select 
                        value={newFieldEntity}
                        onChange={(e) => setNewFieldEntity(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="contact">Contact</option>
                        <option value="deal">Deal</option>
                        <option value="activity">Activity</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        type="button" 
                        onClick={addCustomField}
                        className="btn-primary px-3 py-1 text-sm"
                      >
                        Add Field
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <TagIcon className="w-5 h-5" /> Tags Management
        </h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Available Tags</h3>
            <button 
              type="button" 
              onClick={() => toggleEditing('tags')} 
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {isEditing.tags ? (
                <><CheckIcon className="w-4 h-4" /> Done Editing</>
              ) : (
                <><EditIcon className="w-4 h-4" /> Edit Tags</>
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {crmSettings.tags.map((tag) => (
              <div 
                key={tag} 
                className={`px-3 py-1.5 bg-primary/10 text-primary rounded-full flex items-center ${isEditing.tags ? 'pr-1' : ''}`}
              >
                {tag}
                {isEditing.tags && (
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 p-1 hover:bg-primary/20 rounded-full"
                    title="Remove tag"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            
            {crmSettings.tags.length === 0 && (
              <div className="text-surface-500 dark:text-surface-400">No tags defined yet</div>
            )}
          </div>
          
          {isEditing.tags && (
            <div className="flex gap-2">
              <input 
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag name"
                className="input-field flex-grow"
              />
              <button 
                type="button" 
                onClick={addTag}
                className="btn-primary flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" /> 
                Add Tag
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          type="button" 
          onClick={handleSaveCrmSettings}
          className="btn-primary flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving CRM Settings...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              Save All CRM Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CrmSettings;