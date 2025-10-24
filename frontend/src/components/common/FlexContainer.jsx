const FlexContainer = function ({ className, ...props }) {
  return (
    <div
      className={`w-full flex justify-center items-center ${className}`}
      {...props}
    >
      {props.children}
    </div>
  );
};

export default FlexContainer;
