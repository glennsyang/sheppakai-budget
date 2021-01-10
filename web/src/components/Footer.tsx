import React from "react";

const Footer = () => {
  return (
    <footer className="bg-orange-500">
      <div className="container mx-auto text-white text-sm font-semibold text-center py-4">
        Copyright © {new Date().getFullYear()} {` `} Sheppakai Budget Inc. All rights reserved
    </div>
    </footer>
  );
};

export default Footer;
