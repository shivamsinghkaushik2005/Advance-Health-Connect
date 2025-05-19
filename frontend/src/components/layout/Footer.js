import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// MUI Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();

  // Footer navigation links
  const footerLinks = [
    {
      title: t('app.name'),
      links: [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.doctors'), path: '/doctors' },
        { name: t('nav.appointments'), path: '/appointments' },
        { name: t('nav.healthCamps'), path: '/health-camps' },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { name: t('footer.healthTips'), path: '/health-tips' },
        { name: t('footer.faq'), path: '/faq' },
        { name: t('footer.blog'), path: '/blog' },
        { name: t('footer.contactUs'), path: '/contact' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { name: t('footer.termsOfService'), path: '/terms' },
        { name: t('footer.privacyPolicy'), path: '/privacy' },
        { name: t('footer.refundPolicy'), path: '/refund' },
        { name: t('footer.about'), path: '/about' },
      ],
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('app.name')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('footer.tagline')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                123 Health Avenue, Medical District, Bihar
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                +91 9876543210
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmailIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                info@healthconnect.com
              </Typography>
            </Box>
            
            {/* Social Media Icons */}
            <Box>
              <IconButton color="primary" aria-label="facebook" component="a" href="https://facebook.com" target="_blank" rel="noopener">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="twitter" component="a" href="https://twitter.com" target="_blank" rel="noopener">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="instagram" component="a" href="https://instagram.com" target="_blank" rel="noopener">
                <InstagramIcon />
              </IconButton>
              <IconButton color="primary" aria-label="youtube" component="a" href="https://youtube.com" target="_blank" rel="noopener">
                <YouTubeIcon />
              </IconButton>
              <IconButton color="primary" aria-label="linkedin" component="a" href="https://linkedin.com" target="_blank" rel="noopener">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Navigation Links */}
          {footerLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Typography variant="h6" color="primary" gutterBottom>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {section.links.map((link, linkIndex) => (
                  <Box component="li" key={linkIndex} sx={{ mb: 1 }}>
                    <Link
                      to={link.path}
                      style={{
                        color: theme.palette.text.secondary,
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Newsletter Signup */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('footer.stayUpdated')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('footer.stayUpdatedDesc')}
            </Typography>
            
            {/* Newsletter form would go here */}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('footer.emailNotification')}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Health Connect. {t('footer.allRightsReserved')}
          </Typography>
          
          <Box sx={{ mt: isMobile ? 2 : 0 }}>
            <Link
              to="/terms"
              style={{
                color: theme.palette.text.secondary,
                marginRight: '1rem',
                textDecoration: 'none',
              }}
            >
              {t('footer.terms')}
            </Link>
            <Link
              to="/privacy"
              style={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
              }}
            >
              {t('footer.privacy')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 