import { css } from 'styled-components';

// Breakpoints
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
};

// Media query helpers
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
};

// Essential responsive mixins
export const responsivePadding = css`
  padding: 12px 16px;
  
  ${media.tablet} {
    padding: 8px 12px;
  }
  
  ${media.mobile} {
    padding: 6px 8px;
  }
`;

export const responsiveFontSize = css`
  font-size: 14px;
  
  ${media.tablet} {
    font-size: 12px;
  }
  
  ${media.mobile} {
    font-size: 11px;
  }
`;

export const responsiveButtonPadding = css`
  padding: 8px 16px;
  
  ${media.tablet} {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  ${media.mobile} {
    padding: 8px 12px;
    font-size: 12px;
    min-width: 70px;
  }
`;
