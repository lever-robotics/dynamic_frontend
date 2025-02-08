/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
    	fontSize: {
    		sm: '0.750rem',
    		base: '1rem',
    		xl: '1.333rem',
    		'2xl': '1.777rem',
    		'3xl': '2.369rem',
    		'4xl': '3.158rem',
    		'5xl': '4.210rem'
    	},
    	// fontFamily: {
    	// 	heading: 'Poppins',
    	// 	body: 'Lustria'
    	// },
		// fontFamily: {
		// 	heading: 'Comfortaa',
		// 	body: 'Lustria',
		//   },
    	fontWeight: {
    		normal: '400',
    		bold: '700'
    	},
    	extend: {
			fontFamily: {
				heading: ['Poppins', "sans-serif"],
				body: ['Spline-Sans', "serif"],
			},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				accent: 'hsl(var(--sidebar-accent))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))'
    			},
    			text: {
    				'50': '#f0f4f5',
    				'100': '#e0e8eb',
    				'200': '#c1d1d7',
    				'300': '#a2bbc3',
    				'400': '#84a4ae',
    				'500': '#658d9a',
    				'600': '#51717b',
    				'700': '#3c555d',
    				'800': '#28383e',
    				'900': '#141c1f',
    				'950': '#0a0e0f',
    				DEFAULT: '#0f1517'
    			},
    			background: {
    				'50': '#eef4f6',
    				'100': '#ddeaee',
    				'200': '#bbd4dd',
    				'300': '#99bfcc',
    				'400': '#77aabb',
    				'500': '#5595aa',
    				'600': '#447788',
    				'700': '#335966',
    				'800': '#223b44',
    				'900': '#111e22',
    				'950': '#090f11',
    				DEFAULT: '#f7fafb'
    			},
    			primary: {
    				'50': '#e6f9ff',
    				'100': '#cdf4fe',
    				'200': '#9ae8fe',
    				'300': '#68ddfd',
    				'400': '#35d2fd',
    				'500': '#03c6fc',
    				'600': '#029fca',
    				'700': '#027797',
    				'800': '#014f65',
    				'900': '#012832',
    				'950': '#001419',
    				DEFAULT: '#7ce2fe'
    			},
    			secondary: {
    				'50': '#eaf7fa',
    				'100': '#d5eff6',
    				'200': '#acdeec',
    				'300': '#82cee3',
    				'400': '#59bdd9',
    				'500': '#2fadd0',
    				'600': '#268aa6',
    				'700': '#1c687d',
    				'800': '#134553',
    				'900': '#09232a',
    				'950': '#051115',
    				DEFAULT: '#83cee3'
    			},
    			accent: {
    				'50': '#e8f8fc',
    				'100': '#d2f1f9',
    				'200': '#a5e2f3',
    				'300': '#78d4ed',
    				'400': '#4ac6e8',
    				'500': '#1db7e2',
    				'600': '#1793b5',
    				'700': '#126e87',
    				'800': '#0c495a',
    				'900': '#06252d',
    				'950': '#031217',
    				DEFAULT: '#53c8e9'
    			}
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
