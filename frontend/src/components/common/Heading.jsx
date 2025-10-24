const Heading = function ({ title, className, ...props }) {
  return (
    <h1 className={`text-4xl font-bold ${className}`} {...props}>
      {title ? title : "title"}
    </h1>
  );
};

export default Heading;
