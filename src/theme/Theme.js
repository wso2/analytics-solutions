import { createMuiTheme } from '@material-ui/core/styles';

export const dark = createMuiTheme({
  overrides: {
    MuiGrid: {
      container: {
        backgroundColor: '#303030',
      }
    },
    MuiButton: {
      root: {
        color: '#ffffff',
      }
    },

    MuiMenuItem: {
      selected: {
        color: "grey",
        backgroundColor: 'red'
      },
      root: {
        color: '#ffffff',
        fontSize: 12,
        autoWidth: 'true',
        backgroundColor: '#303030',
      }
    },
    MuiSelect: {
      root: {
        backgroundColor: '#303030',
        color: '#ffffff',
        width: 150,
        margin: 5,
        fontSize: 13
      },
    },
  },
});

export const light = createMuiTheme({
  overrides: {

    MuiGrid: {
      root: {
        background: 'ffffff',
        color: '#ffffff',
      }
    },
    MuiSelect: {
      root: {
        color: '#000',
        width: 150,
        margin: 5,
        fontSize: 13,

      }
    },
    MuiButton: {
      root: {
        color: '#000',
      }
    },

  },
});

