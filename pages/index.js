import { Button, DatePicker, Input, Modal, Select } from "antd";
import axios from "axios";
import dayJS from "dayjs";
import { toaster } from "evergreen-ui";
import { Formik } from "formik";
import jsCookie from 'js-cookie';
import Head from "next/head";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from "react";
import CsvDownload from "react-json-to-csv";
import * as yup from "yup";
import Navbar from "../components/common/Navbar";

function Home() {
  const [markedServices, setMarkedServices] = useState([]);
  const [options, setOptions] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [marking, setMakring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [service, setService] = useState("First Service");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [queryDate, setQueryDate] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchedServices, setSearchedServices] = useState(null);
  const [token, setToken] = useState(true);
  const [searchingServices, setSearchingServices] = useState(false)

  const router = useRouter();

  useEffect(() => {
    let tokenCookie = jsCookie.get('token')
    if (!tokenCookie) {
      router.push('/login');
    }
    else {
      setToken(tokenCookie)
      setSearchingServices(true)
      try {
        refetchService()
      } catch (error) {
      } finally {
        setSearchingServices(false)
      }
    }
  }, []);

  const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;

  const userValidationSchema = yup.object().shape({
    firstName: yup.string().required("Please enter your first name."),
    lastName: yup.string().required("Please enter your last name."),
    email: yup.string().email("Please enter a proper email."),
    phone: yup
      .string()
      .required("Please enter your phone number.")
      .matches(phoneRegExp, "Phone number is not valid."),
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
      }, {
        headers: {
          Authorization: `jwt ${token}`,
        },
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

  const searchServices = async () => {
    setSearching(true);
    try {
      if (!queryDate) {
        setSearching(false);
        return false;
      }
      const { data } = await axios.get(
        `/services/search?date=${dayJS(queryDate).format("MM-DD-YYYY")}`
      ,{
        headers: {
          Authorization: `jwt ${token}`,
        },
      });
      setSearchedServices(data.services);
    } catch (error) {
      if (!error.response) {
        toaster.danger("Unable to query services", {
          description: "May be a network error.",
        });
      } else if (error.response.status === 500) {
        toaster.danger("Unable to query services", {
          description: "May be a problem from our side. We'll investigate.",
        });
      }
    } finally {
      setSearching(false);
      refetchService();
    }
  };

  const refetchService = async () => {
    const { data } = await axios.get(`/services?date=${dayJS().format("MM-DD-YYYY")}`,{
        headers: {
          Authorization: `jwt ${jsCookie.get('token')}`,
        },
      });
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
      const { data } = await axios.get(`/users/search?search=${value}`,{
        headers: {
          Authorization: `jwt ${token}`,
        },
      });
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

  const setModalFunc = (bool) => {
    setShowModal(bool);
  };
  const setRequestModalFunc = (bool) => {
    setShowRequestModal(bool);
  };
  return token ? (
    <div className="h-screen w-screen">
      <Head>
        <title>CGMI Garden City Attendance</title>
      </Head>
      <Navbar setModalFunc={setModalFunc} setRequestModalFunc={setRequestModalFunc} />
      <div className="h-full w-screen flex flex-col items-center px-8 pb-8 overflow-x-hidden">
        <div className="max-w-lg flex flex-col items-center text-center mt-32 smallTablet:mt-8">
          <img src="/images/church-Of-God-Mission-international.png" className="w-auto h-32 mb-4" />
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
                <Option value={user._id} key={user.name + index}>
                  {user.name}
                </Option>
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
          {!searchingServices ? markedServices?.map((service, index) => {
            return (
              <div className="w-full text-left mt-16" key={service.name + index}>
                <p className="text-xl font-semibold">{service.name}</p>
                <div className="w-full flex justify-between mb-2">
                  <p className="text-lg font-medium">{service.type}</p>
                  <CsvDownload
                    className="px-2 py-1 border-black border-solid shadow-outline"
                    data={service.attendees}
                    filename={`${service.name}_${service.type}.csv`}
                  />
                </div>
                <ul className="ul-list-spread">
                  {service?.attendees?.map((attendee, index) => (
                    <li className="mb-3" key={attendee.firstName + index}>
                      {attendee.firstName} {attendee.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }) : <p>Fecthing Services</p>}
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
              const { data } = await axios.post("/users", form, {
        headers: {
          Authorization: `jwt ${token}`,
        },
      });
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
      <Modal
        visible={showRequestModal}
        onCancel={() => setShowRequestModal(false)}
        centered={true}
        footer={null}
        title="Query Services"
      >
        <div className="w-full mb-3 max-h-full">
          <label>Select Service Date</label>
          <Input.Group className="w-full flex mt-2 phone:flex-col">
            <DatePicker
              size="large"
              className="w-full"
              onChange={(value) => setQueryDate(value)}
              value={queryDate}
            />
            <Button
              type="primary"
              size="large"
              disabled={searching}
              onClick={() => searchServices()}
            >
              {searching ? "Searching" : "Search"}
            </Button>
          </Input.Group>
          {searchedServices?.map((service, index) => {
            return (
              <div className="w-full text-left mt-16 overflow-visible" key={service.name + index}>
                <p className="text-xl font-semibold">{service.name}</p>
                <div className="w-full flex justify-between mb-2">
                  <p className="text-lg font-medium">{service.type}</p>
                  <CsvDownload
                    className="px-2 py-1 border-black border-solid shadow-outline"
                    data={service.attendees}
                    filename={`${service.name}_${service.type}.csv`}
                  />
                </div>
                <ul className="ul-list-spread">
                  {service?.attendees?.map((attendee, index) => (
                    <li className="mb-2" key={attendee.firstName + index}>
                      {attendee.firstName} {attendee.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  ) : (
      <div>
        <p>You will be redirected shortly</p>
      </div>
  );
}

export default Home;
