import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-10 text-center text-muted-foreground">
      <Loader2 className="animate-spin w-8 h-8 mb-2 text-furnish-terracotta" />
    </div>
  );
};

export default Loader;
