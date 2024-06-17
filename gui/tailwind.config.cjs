const { default: daisyui } = require('daisyui');

module.exports = {
	content: ['./src/routes/**/*.{svelte,js,ts}'],
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['dark', 'light']
	}
};
