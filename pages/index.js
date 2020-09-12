import { Button, Input, Modal, Select } from "antd";
import axios from "axios";
import dayJS from "dayjs";
import { toaster } from "evergreen-ui";
import { Formik } from "formik";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import * as yup from "yup";

function Home({ services, users }) {
  const [markedServices, setMarkedServices] = useState([]);
  const [options, setOptions] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [marking, setMakring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    console.log(services);
    console.log(users);
    setMarkedServices(services);
    setOptions(users);
  }, []);

  const userValidationSchema = yup.object().shape({
    firstName: yup.string().required("Please enter your first name"),
    lastName: yup.string().required("Please enter your last name"),
    email: yup.string().email("Please enter a proper email"),
    phone: yup
      .number()
      .required("Please enter your phone number")
      .moreThan(9, "Phone number should be 11 digits")
      .lessThan(12, "Phone number should be 11 digits"),
  });

  const { Option } = Select;

  const markUser = async () => {
    setMakring(true);
    try {
      if (selectedUsers.length < 1) return false;
      const { data } = await axios.post("/services", {
        attendees: selectedUsers,
        date: dayJS().format("DD-MM-YYYY"),
        type: "First Service",
      });
      setSelectedUsers([]);
      toaster.success(`${data.message}`);
    } catch (error) {
      console.log(error);
    } finally {
      setMakring(false);
      refetchService();
    }
  };

  const refetchService = async () => {
    const { data } = await axios.get(`/services?date=${dayJS().format("DD-MM-YYYY")}`);
    setMarkedServices(data.services);
  };

  const filterOptions = (value) => {
    if (value.length > 2) {
      if (searchId) {
        clearTimeout(searchId);
        setSearchId(setTimeout(() => fetchUsers(value), 500));
      } else {
        setSearchId(setTimeout(() => fetchUsers(value), 500));
      }
    } else {
      if (searchId) {
        clearTimeout(searchId);
      }
    }
  };

  const fetchUsers = async (value) => {
    try {
      setSelectLoading(true);
      const { data } = await axios.get(`/users/search?search=${value}`);
      setOptions(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setSelectLoading(false);
    }
  };
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <div className="h-screen w-screen flex flex-col items-center justify-center px-8">
        <div className="max-w-lg flex flex-col items-center text-center">
          <p className="text-3xl font-semibold">Welcome to Church</p>
          <p>Please search for you name in the search bar and press enter to mark your attendace</p>
          <Input.Group className="w-full flex mt-8">
            <Select
              mode="multiple"
              size="large"
              className="w-full max-w-md"
              placeholder="Please search your name here"
              filterOption={false}
              loading={selectLoading}
              onChange={(value) => setSelectedUsers(value)}
              onSearch={(value) => filterOptions(value)}
              value={selectedUsers}
            >
              {options.map((user, index) => (
                <Option value={user._id}>{user.name}</Option>
              ))}
            </Select>
            <Button type="primary" size="large" disabled={marking} onClick={() => markUser()}>
              {marking ? "Marking" : "Mark Present"}
            </Button>
          </Input.Group>
          <div className="mt-16">
            <p>New to the platform?</p>
            <Button type="primary" size="large" onClick={() => setShowModal(true)}>
              Register
            </Button>
          </div>
          {markedServices?.map((service, index) => {
            return (
              <div className="w-full text-left mt-16">
                <p className="text-xl font-semibold">{service.name}</p>
                <ul>
                  {service?.attendees?.map((attendee, index) => (
                    <li>
                      {attendee.firstName} {attendee.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        centered={true}
        maskClosable={false}
        closable={false}
        footer={null}
        className="w-full max-w-lg"
        title="Registration"
      >
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: null,
          }}
          validationSchema={userValidationSchema}
          onSubmit={async (values, { resetForm }) => {
            setCreatingUser(true);
            try {
              const { data } = await axios.post("/api/users", values);
              toaster.success(`${data.message}`);
              resetForm();
            } catch (error) {
              if (!error.response) {
                toaster.danger("Unable to register", {
                  description: "May be a network error",
                });
              } else if (error.response.status === 500) {
                toaster.danger("Unable to register", {
                  description: "May be a problem from our side. We'll investigate",
                });
              } else {
                console.log(error.response.data);
                toaster.danger("Unable to register", {
                  // description: `${error.response.data.errors[0].msg}`,
                });
              }
            } finally {
              setCreatingUser(false);
            }
          }}
          enableReinitialize
        >
          {({ values, handleChange, handleSubmit, touched, errors, resetForm }) => {
            return (
              <form className="px-6 pb-6 pt-4 flex flex-col" onSubmit={handleSubmit}>
                <div className="w-full mb-3">
                  <label>First Name</label>
                  <Input
                    className="w-full"
                    placeholder="Enter First Name"
                    name="firstName"
                    size="large"
                    value={values.firstName}
                    onChange={handleChange}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="w-full mb-3">
                  <label>Last Name</label>
                  <Input
                    className="w-full"
                    placeholder="Enter Last Name"
                    name="lastName"
                    size="large"
                    value={values.lastName}
                    onChange={handleChange}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div className="w-full mb-3">
                  <label>Email (optional)</label>
                  <Input
                    className="w-full"
                    placeholder="Enter Email"
                    type="email"
                    name="email"
                    size="large"
                    value={values.email}
                    onChange={handleChange}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="w-full mb-3">
                  <label>Phone Number</label>
                  <Input
                    className="w-full"
                    placeholder="Enter Phone Number"
                    type="tel"
                    name="phone"
                    size="large"
                    value={values.phone}
                    onChange={handleChange}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <Button type="primary" size="large" className="w-full mb-3" htmlType="submit">
                  Register
                </Button>
                <Button
                  className="w-full"
                  size="large"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                >
                  Cancel
                </Button>
              </form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
}

export async function getServerSideProps(context) {
  let data;
  let res;
  let services = [];
  let users = [];
  try {
    res = await axios.get(`/services?date=${dayJS().format("DD-MM-YYYY")}`);
    data = res.data;
    services = data.services.length > 0 ? data.services : [];

    res = await axios.get(`/users`);
    data = res.data;
    console.log(data);
    users = data.users.length > 0 ? data.users : [];
  } catch (error) {
    console.log(error);
  } finally {
    return {
      props: {
        services,
        users,
      },
    };
  }
}

export default Home;
