const Heading = function ({ title, className, ...props }) {
  return (
    <h1
      className={`text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ${className}`}
      {...props}
    >
      {title ? title : "title"}
    </h1>
  );
};

export default Heading;
