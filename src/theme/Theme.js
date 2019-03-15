import { createMuiTheme } from '@material-ui/core/styles';
export const dark = createMuiTheme({
  overrides: {

    MuiPopover: {
      paper: {
        borderRadius: 0,
        // backgroundColor: '#323435',
      }
    },
    MuiGrid: {
      container: {
        backgroundColor: '#323435',
      }
    },
    MuiButton: {
      root: {
        color: '#ffffff',
      },

    },
    MuiList: {
      root: {
        backgroundColor: '#303030',
      },
    },
    MuiListItem: {
      selected: {
        backgroundColor: 'red'
      }
    },

    MuiInput: {
      root: {
        underline: '#ffffff',
        color: '#ffffff',
        fontSize: 13,
      },
    },
    MuiInputLabel: {
      root: {
        color: '#ffffff',
      },
    },
    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: '#444'
        },
        color: '#ffffff',
        fontSize: 12,
        backgroundColor: '#303030',
      },

    },
    MuiSelect: {
      root: {
        color: '#ffffff',
        width: 130,
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
    MuiInput: {
      root: {
        color: '#000',
        fontSize: 13,
      }
    },

  },
});

