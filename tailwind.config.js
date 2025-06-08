const { spacing } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./sections/*.liquid",
    "./layout/*.liquid",
    "./templates/*.json",
    "./snippets/*.liquid",
    "./__pages/*.html"
  ],
  safelist: [
    'bg-[black]',
    'bg-[gray]',
    'bg-[white]',
    '!visible'
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        // => @media (min-width: 640px) { ... }
        'md': '768px',
        // => @media (min-width: 768px) { ... }
        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }
        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }
        'pdp': '1400px',
        // => @media (min-width: 1280px) { ... }
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
      fontFamily: {
        'body': ['Poppins', 'sans-serif'],
        'title': ['Merriweather', 'sans-serif'],
        'subtitle': ['Inter', 'Poppins', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#445429',
        'brand-secondary': '#ffff00',
        'black': '#000000',
        'white': '#ffffff',
        'light-grey': '#F5F5F5',
        'lighter-green': '#DEE7D5',
        'dark-green': '#2A4125',
        'nearly-black': '#424242',
        'ruby-red': '#C81E25',
        'gray': {
          '100': '#f3f3f3',
          '200': '#EBEBEB',
          '300': '#D8D8D8',
          '400': '#B6B6B6',
          '500': '#9E9E9E',
          '600': '#737373',
          '700': '#383838',
        },
        'error': '#A60505',
        'success': '#356740',
      },
      // This is required to work with Hyva child theme, can be ignored for Centra/Shopify builds
      textColor: {
        primary: {
          lighter: 'black',
          "DEFAULT": 'black',
          darker: 'black'
        },
        secondary: {
          lighter: 'black',
          "DEFAULT": 'black',
          darker: 'black'
        },
      },
      backgroundColor: {
        primary: {
          lighter: 'white',
          "DEFAULT": 'white'
        },
        secondary: {
          "DEFAULT": 'white',
          darker:'white'
        },
        container: {
          lighter: 'white',
          "DEFAULT": 'white',
          darker: 'white'
        }
      },
      borderColor: theme => ({
        primary: {
          lighter: theme('colors.gray.200'),
          "DEFAULT": theme('colors.gray.200'),
        },
        container: {
          lighter: theme('colors.gray.200'),
          "DEFAULT": theme('colors.gray.200'),
          darker: theme('colors.gray.200'),
        }
      }),
      minWidth: {
        8: spacing["8"],   // 2rem / 32px
        20: spacing["20"], // 5rem / 80px
        40: spacing["40"], // 10rem / 160px
        48: spacing["48"], // 12rem / 192px
      },
      minHeight: {
        14: spacing["14"], // 3.5rem / 56px
        'screen-25': '25vh',
        'screen-50': '50vh',
        'screen-75': '75vh',
      },
      maxHeight: {
        '0': '0',
        'screen-25': '25vh',
        'screen-50': '50vh',
        'screen-75': '75vh',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem', // 20px < 1024px mobile container padding
          lg: '2.5rem' // 40px >= 1024 desktop container padding
        }
      },
      fontSize: {
        'title-1-super': '4.5rem', // 72px
        'title-1-plus': '4rem', // 64px
        'title-1': '3.5rem', // 56px
        'title-2': '3rem', // 48px
        'title-3': '2.5rem', // 40px
        'title-4': '2.25rem', // 36px
        'title-5': '2rem', // 32px
        'title-6': '1.75rem', // 28px
        'mob-title-1-super': '3rem', // 48px
        'mob-title-1-plus': '2.5rem', // 40px
        'mob-title-1': '2.25rem', // 36px
        'mob-title-2': '2rem', // 32px
        'mob-title-3': '1.75rem', // 28px
        'mob-title-4': '1.5rem', // 24px
        'mob-title-5': '1.25rem', // 20px
        'mob-title-6': '1.125rem', // 18px
        'base': '0.9375rem', // 15px
        'breadcrumbs': '0.625rem', // 10px
      },
      lineHeight: {
        'title': '1.1', // 110%
        'body': '1.5', // 150%
        'large-body': '1.65', // 165%
        'zero': '0',
      },
      letterSpacing: {
        'minus-3': '-0.03em', // -3%
        'minus-1': '-0.01em', // -1%
        'footer-titles': '0.15em' // 15%
      },
      boxShadow: {
        "DEFAULT": '0px 0px 12px 0px rgba(0, 0, 0, 0.15)'
      },
      padding: {
        'product_card': '133.33375%'
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['last', 'hover', 'focus'],
      margin: ['last'],
      opacity: ['disabled'],
      backgroundColor: ['even', 'odd'],
      ringWidth: ['active']
    }
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen md': {
            maxWidth: '1800px',
          }
        },
        '.container-full': {
          maxWidth: '100%',
          paddingLeft: '16px',
          paddingRight: '16px',
          '@screen md': {
            paddingLeft: '32px',
            paddingRight: '32px'
          }
        },
      })
    },
    require('@tailwindcss/forms'), require('@tailwindcss/typography')
  ],
  // Examples for excluding patterns from purge
};
