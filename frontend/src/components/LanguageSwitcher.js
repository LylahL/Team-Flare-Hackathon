import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Button } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  return (
    <div>
      <Button onClick={handleClick} color="inherit">
        {i18n.language.toUpperCase()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
        <MenuItem onClick={() => changeLanguage('es')}>Español</MenuItem>
        <MenuItem onClick={() => changeLanguage('fr')}>Français</MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;

