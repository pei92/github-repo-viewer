import './globals.css';

export const metadata = {
  title: 'GitHub Release Viewer',
  description: 'Search GitHub repositories and find their releases.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}