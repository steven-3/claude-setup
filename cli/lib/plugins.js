'use strict';

function getPluginDefaults() {
  return {
    enabledPlugins: {
      'superpowers@claude-plugins-official': true,
      'claude-md-management@claude-plugins-official': true,
      'frontend-design@claude-plugins-official': true,
      'ui-ux-pro-max@ui-ux-pro-max-skill': true,
    },
    extraKnownMarketplaces: {
      'ui-ux-pro-max-skill': {
        source: { source: 'github', repo: 'nextlevelbuilder/ui-ux-pro-max-skill' },
      },
    },
  };
}

module.exports = { getPluginDefaults };
