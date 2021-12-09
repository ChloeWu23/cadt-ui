import React from 'react';
import { withTheme } from 'styled-components';

const SuccessIcon = withTheme(({ width, height }) => {
  return (
    <>
      <svg
        width={`${width}px`}
        height={`${height}px`}
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15.3819 7.27344H14.2827C14.0436 7.27344 13.8163 7.38828 13.6757 7.58516L9.99128 12.6945L8.32252 10.3789C8.18189 10.1844 7.95689 10.0672 7.71549 10.0672H6.61626C6.46392 10.0672 6.37486 10.2406 6.46392 10.3648L9.38424 14.4148C9.45323 14.5111 9.54418 14.5896 9.64954 14.6437C9.7549 14.6978 9.87165 14.7261 9.9901 14.7261C10.1086 14.7261 10.2253 14.6978 10.3307 14.6437C10.436 14.5896 10.527 14.5111 10.596 14.4148L15.5319 7.57109C15.6233 7.44688 15.5343 7.27344 15.3819 7.27344Z"
          fill="#52C41A"
        />
        <path
          d="M11 0.5C5.20156 0.5 0.5 5.20156 0.5 11C0.5 16.7984 5.20156 21.5 11 21.5C16.7984 21.5 21.5 16.7984 21.5 11C21.5 5.20156 16.7984 0.5 11 0.5ZM11 19.7188C6.18594 19.7188 2.28125 15.8141 2.28125 11C2.28125 6.18594 6.18594 2.28125 11 2.28125C15.8141 2.28125 19.7188 6.18594 19.7188 11C19.7188 15.8141 15.8141 19.7188 11 19.7188Z"
          fill="#52C41A"
        />
      </svg>
    </>
  );
});

export { SuccessIcon };