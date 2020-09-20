import { Button, Input, Modal, Select } from "antd";
import axios from "axios";
import dayJS from "dayjs";
import { toaster } from "evergreen-ui";
import { Formik } from "formik";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import CsvDownload from "react-json-to-csv";
import * as yup from "yup";

function Home({ services }) {
  const [markedServices, setMarkedServices] = useState([]);
  const [options, setOptions] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [marking, setMakring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [service, setService] = useState("First Service");

  useEffect(() => {
    setMarkedServices(services);
  }, []);

  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const userValidationSchema = yup.object().shape({
    firstName: yup.string().required("Please enter your first name."),
    lastName: yup.string().required("Please enter your last name."),
    email: yup.string().required("Please enter your email.").email("Please enter a proper email."),
    phone: yup
      .string()
      .required("Please enter your phone number.")
      .matches(phoneRegExp, "Phone number is not valid.")
      .test("len", "Phone number should be 11 digits.", (val) => val.length === 11),
  });

  const { Option } = Select;

  const markUser = async () => {
    setMakring(true);
    try {
      if (selectedUsers.length < 1) return false;
      const { data } = await axios.post("/services", {
        attendees: selectedUsers,
        date: dayJS().format("MM-DD-YYYY"),
        type: service,
      });
      setSelectedUsers([]);
      data.notification.forEach((notif) => {
        if (notif.success) toaster.success(`${notif.message}`);
        else toaster.warning(`${notif.message}`);
      });
    } catch (error) {
      if (!error.response) {
        toaster.danger("Unable to mark attendance", {
          description: "May be a network error",
        });
      } else if (error.response.status === 500) {
        toaster.danger("Unable to mark attendance", {
          description: "May be a problem from our side. We'll investigate",
        });
      }
    } finally {
      setMakring(false);
      refetchService();
    }
  };

  const refetchService = async () => {
    const { data } = await axios.get(`/services?date=${dayJS().format("MM-DD-YYYY")}`);
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
      if (!error.response) {
        toaster.danger("Unable to search for users", {
          description: "May be a network error",
        });
      } else if (error.response.status === 500) {
        toaster.danger("Unable to search for users", {
          description: "May be a problem from our side. We'll investigate",
        });
      }
    } finally {
      setSelectLoading(false);
    }
  };
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <div className="h-full w-screen flex flex-col items-center px-8 overflow-hidden">
        <div className="max-w-lg flex flex-col items-center text-center mt-32 smallTablet:mt-8">
          <p className="text-3xl font-semibold">Welcome to CGMI Garden City</p>
          <p>Please search for you name in the search bar and press enter to mark your attendace</p>
          <Input.Group className="w-full flex mt-8 phone:flex-col">
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
          <label className="mt-4">Select Service</label>
          <Select
            size="large"
            value={service}
            onChange={(value) => setService(value)}
            className="w-full"
          >
            <Option value="First Service">First Service</Option>
            <Option value="Second Service">Second Service</Option>
          </Select>
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
                <div className="w-full flex justify-between">
                  <p className="text-lg font-medium">{service.type}</p>
                  <CsvDownload
                    className="px-2 py-1 border-black border-solid shadow-outline"
                    data={service.attendees}
                    filename={`${service.name}_${service.type}.csv`}
                  />
                </div>
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
        className=""
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
            const form =
              values.email.length > 0
                ? { ...values, service }
                : {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    phone: values.phone,
                    service,
                  };
            try {
              const { data } = await axios.post("/users", form);
              toaster.success(`${data.message}`);
              refetchService();
              resetForm();
            } catch (error) {
              if (!error.response) {
                toaster.danger("Unable to register", {
                  description: "May be a network error",
                });
              } else if (error.response.status === 400 || error.response.status === 401) {
                toaster.danger("Unable to register", {
                  description: error.response.data.message,
                });
              } else if (error.response.status === 500) {
                toaster.danger("Unable to register", {
                  description: "May be a problem from our side. We'll investigate",
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
                  <label>Email</label>
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
                    name="phone"
                    size="large"
                    value={values.phone}
                    onChange={handleChange}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <Button
                  type="primary"
                  size="large"
                  className="w-full mb-3"
                  htmlType="submit"
                  disabled={creatingUser}
                >
                  Register
                </Button>
                <Button
                  className="w-full"
                  size="large"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  disabled={creatingUser}
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
  let services = [];
  try {
    const { data } = await axios.get(
      `https://cgmi-vi-attendance.vercel.app/api/services?date=${dayJS().format("MM-DD-YYYY")}`
    );
    services = data.services.length > 0 ? data.services : [];
  } catch (error) {
  } finally {
    return {
      props: {
        services,
      },
    };
  }
}

export default Home;
