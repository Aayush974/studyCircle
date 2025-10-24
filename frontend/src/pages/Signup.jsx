import { Heading, FlexContainer, SignUpForm } from "../components/";

const Signup = function () {
  return (
    <>
      <FlexContainer className={"flex-col w-screen h-screen gap-8"}>
        <Heading title={"Signup Form"} />
        <SignUpForm />
      </FlexContainer>
    </>
  );
};

export default Signup;
