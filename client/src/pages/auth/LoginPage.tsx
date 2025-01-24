import { Button, Flex } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../../assets/logo.png';
import toastMessage from '../../lib/toastMessage';
import { useLoginMutation } from '../../redux/features/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/services/authSlice';
import decodeToken from '../../utils/decodeToken';

const LoginPage = () => {
  const [userLogin] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'snehaamancha21@gmail.com',
      password: 'sneha@123',
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading('Logging in...');
    try {
      const res = await userLogin(data).unwrap();

      if (res.statusCode === 200) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate('/');
        toast.success('Successfully Logged In!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.data.message || 'An error occurred', { id: toastId });
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  return (
    <>
      <header
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '1rem 0',
          backgroundColor: '#164863',
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
      >
        Topic Name: Institute Stock Management System
      </header>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 72px)', 
          backgroundColor: '#f0f8ff',
        }}
      >
        <div
          style={{
            width: '90%',
            maxWidth: '400px',
            padding: '2rem',
            borderRadius: '10px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(145, 49, 49, 0.1)',
          }}
        >
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src={logo}
              alt="Institute Logo"
              style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            />
            <h2
              style={{
                margin: '0.5rem 0',
                color: '#fff',
                backgroundColor: 'red',
                borderRadius: '25px',
                padding: '0.3rem 1rem',
              }}
            >
              Marcos Institute
            </h2>
          </header>

          {/* Login Form */}
          <h1
            style={{
              marginBottom: '1rem',
              textAlign: 'center',
              textTransform: 'uppercase',
              color: '#164863',
            }}
          >
            Login
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              {...register('email', { required: true })}
              placeholder="Your Email*"
              className={`input-field ${errors['email'] ? 'input-field-error' : ''}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.8rem',
                marginBottom: '1rem',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <input
              type="password"
              placeholder="Your Password*"
              className={`input-field ${errors['password'] ? 'input-field-error' : ''}`}
              {...register('password', { required: true })}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.8rem',
                marginBottom: '1.5rem',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
            <Flex justify="center">
              <Button
                htmlType="submit"
                type="primary"
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  width: '100%',
                  backgroundColor: '#164863',
                  borderColor: '#164863',
                  padding: '0.8rem',
                }}
              >
                Login
              </Button>
            </Flex>
          </form>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register Here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
