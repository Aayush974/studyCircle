const Image = function ({ src, alt, className, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      {...props}
    />
  );
};

export default Image;
