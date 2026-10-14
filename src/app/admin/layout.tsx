const themeScript = `(function(){try{var t=localStorage.getItem("aroma-admin-theme");if(t==="light"||t==="dark")document.documentElement.dataset.adminTheme=t;}catch(e){}})();`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </>
  );
}
