import { Heading, FlexContainer, LoginForm } from "../components/";

const Login = function () {
  return (
    <>
      <FlexContainer className={"flex-col w-screen h-screen gap-8"}>
        <Heading title={"Login Form"} />
        <LoginForm />
      </FlexContainer>
    </>
  );
};

export default Login;
