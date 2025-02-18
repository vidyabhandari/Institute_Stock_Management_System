import { Button, Flex } from "antd";
import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
import toastMessage from "../../lib/toastMessage";
import { useRegisterMutation } from "../../redux/features/authApi";
import { useAppDispatch } from "../../redux/hooks";
import { loginUser } from "../../redux/services/authSlice";
import decodeToken from "../../utils/decodeToken";

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userRegistration] = useRegisterMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading("Registering new account!");
    try {
      const res = await userRegistration(data).unwrap();

      if (data.password !== data.confirmPassword) {
        toastMessage({
          icon: "error",
          text: "Password and confirm password must be same!",
        });
        return;
      }
      if (res.statusCode === 201) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate("/");
        toast.success(res.message, { id: toastId });
      }
    } catch (error: any) {
      toastMessage({ icon: "error", text: error.data.message });
    }
  };

  return (
    <>
      <header
        style={{
          width: "100%",
          textAlign: "center",
          padding: "1rem 0",
          backgroundColor: "#164863",
          color: "#fff",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Topic Name: Institute Stock Management System
      </header>
      <Flex
        justify="center"
        align="center"
        style={{ height: "100vh", backgroundColor: "#f0f8ff" }}
      >
        <Flex
          vertical
          style={{
            width: "90%",
            maxWidth: "450px",
            padding: "2rem",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(155, 49, 49, 0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <img
              src={logo}
              alt="Institute Logo"
              style={{ width: "100px", height: "90px", borderRadius: "50%" }}
            />
            <h2
              style={{
                margin: "0.3rem 0",
                color: "white",
                border: "1px solid white",
                borderRadius: "25px",
                padding: "2px",
                backgroundColor: "red",
              }}
            >
              Marcos Institute
            </h2>
          </div>

          <h1
            style={{
              marginBottom: ".7rem",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            Register
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              {...register("name", { required: true })}
              placeholder="Your Name*"
              className={`input-field ${
                errors["name"] ? "input-field-error" : ""
              }`}
            />
            <input
              type="text"
              {...register("email", { required: true })}
              placeholder="Your Email*"
              className={`input-field ${
                errors["email"] ? "input-field-error" : ""
              }`}
            />
            <input
              type="password"
              placeholder="Your Password*"
              {...register("password", { required: true })}
              className={`input-field ${
                errors["password"] ? "input-field-error" : ""
              }`}
            />
            <input
              type="password"
              placeholder="Confirm Password*"
              {...register("confirmPassword", { required: true })}
              className={`input-field ${
                errors["confirmPassword"] ? "input-field-error" : ""
              }`}
            />
            <Flex justify="center">
              <Button
                htmlType="submit"
                type="primary"
                style={{
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  width: "100%",
                  backgroundColor: "#164863",
                  borderColor: "#164863",
                  padding: "0.8rem",
                }}
              >
                REGISTER
              </Button>
            </Flex>
          </form>
          <p style={{ marginTop: "1rem" }}>
            Already have an account? <Link to="/login">Login Here</Link>
          </p>
        </Flex>
      </Flex>
    </>
  );
};

export default RegisterPage;
