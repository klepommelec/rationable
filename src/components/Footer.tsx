
const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Decision Helper. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
