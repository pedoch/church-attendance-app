import { Button, Form, Input, Tabs } from 'antd';
import axios from 'axios';
import { Spinner, toaster } from 'evergreen-ui';
import jsCookie from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const { TabPane } = Tabs;

function LogIn(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post('/admin', { email, password })
      setIsSubmitting(false);

      // login(res.data, rememberMe);
      jsCookie.set('admin', data.admin)
      jsCookie.set('token', data.token)

      setEmail('')
      setPassword('')

      toaster.success('Login successful', {
        description: `Welcome ${data.admin.firstName}`,
      });

      return router.push(`/`);
    } catch (error) {
        if (!error.response) {
          toaster.danger('Login failed', {
            description: 'May be a network eror',
          });
        } else if (error.response.status === 500) {
          toaster.danger('Login failed', {
            description: "May be a problem from our side. We'll investigate",
          });
        } else {
          toaster.danger('Login failed', {
            description: `${error.response.data.errors[0].msg}`,
          });
        }

        setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = () => {

    axios
      .put('/admin', { email, password, firstName, lastName, type: 'Admin' })
      .then((res) => {
        setIsSubmitting(false);

        // login(res.data, rememberMe);
        // jsCookie.set('admin', res.data.admin)
        // jsCookie.set('token', res.data.token)

        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')

        toaster.success('Sign Up successful', {
          description: 'Please proceed to login...',
        });

        // return router.push(`/`);
      })
      .catch((error) => {
        if (!error.response) {
          toaster.danger('Sign Up failed', {
            description: 'May be a network error',
          });
        } else if (error.response.status === 500) {
          toaster.danger('Sign Up failed', {
            description: "May be a problem from our side. We'll investigate",
          });
        } else {
          toaster.danger('Sign Up failed', {
            description: `${error.response.data.errors[0].msg}`,
          });
        }

        setIsSubmitting(false);
      });
  };
  return (
    <div className="w-screen h-full flex justify-center">
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex flex-col items-center">
        <img src="/images/church-Of-God-Mission-international.png" className="w-32 h-32 my-6" />
       <Tabs defaultActiveKey="1" type="card" size="large">
          <TabPane tab="Login" key="1">
            <div className="flex flex-col justify-center p-12 shadow bg-white">
              <h1 className="text-2xl font-medium mb-4">Login</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  handleSubmit();
                }}
              >
                <Form.Item>
                  <Input
                    placeholder="Email"
                    type="email"
                    required={true}
                    size="large"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Input.Password
                    placeholder="Password"
                    type="password"
                    required={true}
                    size="large"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    visibilityToggle={true}
                  />
                </Form.Item>
                <Button
                  className="w-full flex justify-center items-center"
                  type="primary"
                  htmlType="submit"
                  size="large"
                  disabled={isSubmitting ? true : false}
                >
                  {isSubmitting ? <Spinner size={20} /> : 'Login'}
                </Button>
              </form>
            </div>
          </TabPane>
          <TabPane tab="Sign Up" key="2">
            <div className="flex flex-col justify-center p-12 shadow bg-white">
              <h1 className="text-2xl font-medium mb-4">Sign Up</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  handleSignUpSubmit();
                }}
              >
                <Form.Item>
                  <Input
                    placeholder="First Name"
                    required={true}
                    size="large"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    placeholder="Last Name"
                    required={true}
                    size="large"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    placeholder="Email"
                    type="email"
                    required={true}
                    size="large"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Input.Password
                    placeholder="Password"
                    type="password"
                    required={true}
                    size="large"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    visibilityToggle={true}
                  />
                </Form.Item>
                <Button
                  className="w-full flex justify-center items-center"
                  type="primary"
                  htmlType="submit"
                  size="large"
                  disabled={isSubmitting ? true : false}
                >
                  {isSubmitting ? <Spinner size={20} /> : 'Sign Up'}
                </Button>
              </form>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default LogIn;