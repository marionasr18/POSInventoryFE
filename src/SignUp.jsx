import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FetchData } from './functions';
import Select from 'react-select';
import NavigationBar from './NavigationBar';
import FileDialogue from './FileDialogue';
import { Buffer } from 'buffer';

import Swal from "sweetalert2";

// import './app.css';
// import data from './Users.json';


export default function SignUp() {
    const nav = useNavigate()
    const loc = useLocation()

    const STATE = {
        email: '',
        imgUrl: '',
        sex: '',
        phoneNb: '',
        dob: '',
        password: '',
        passwordConfirm: '',
        sports: '',
        sportsOptions: [{ value: 'bas', label: 'Baskteball' },
        { value: 'voll', label: 'Volley Ball' },
        { value: 'fut', label: 'Futsal' },
        { value: 'foot', label: 'Foot Ball' },],
    }

    const [state, setState] = useState(STATE)
    const FillData = useCallback(async () => {


        let data = await FetchData(`http://localhost:3001/api/users/getUserById`, 'get')

        let finalData = data.data
        if (finalData.success === 1) {
            setState(prv => {
                return {
                    ...prv,
                    email: finalData.data[0].email,
                    imgUrl: finalData.data[0].profile_picture,
                    username: finalData.data[0].username,
                    sex: finalData.data[0].gender,
                    phoneNb: finalData.data[0].phoneNumber,
                    dob: finalData.data[0].dob,
                }
            })
        }
    }, [])
    useEffect(() => {
        if (loc.pathname === '/editProfile') {
            FillData()
        }
    }, [loc])
    const handleChange = useCallback((e) => {
        setState(prv => {
            return {
                ...prv,
                [e.target.name]: e.target.value
            }
        })
    }, [])
    // const submitHandle = () => {
    //     try {

    //         const user = data.map(object => {
    //             return object.username;
    //         })
    //         if (user.indexOf(obj.username) !== -1) {
    //             alert("username already existed !")
    //             return;
    //         }
    //         if (obj.password !== obj.passConfirmation) {
    //             alert("Please make sure that the password match")
    //             return;
    //         }

    //     } catch (error) {
    //         alert(error)
    //     }
    // }
    const handleBack = useCallback(() => {

        nav(-1)
    }, [])
    const handleSaveUser = useCallback(async () => {
        let params = {
            username: state.username,
            email: state.email,
            dob: state.dob,
            address: state.address,
            password: state.password,
            gender: 'M',
            phoneNumber: state.phoneNb,
        }
        console.log(params)
        const data = await FetchData('http://localhost:3001/api/users/createUser', 'post', params)
        if (data.success === 1) {
            console.log('username', state.username);
            const data2 = await FetchData('http://localhost:3001/api/users/createChatUser', 'post', { username: state.username })


            Swal.fire({
                title: "Success",
                text: "Sign Up succesful. Please return to the Login Page",
                icon: "success",
                confirmButtonText: "OK",
              });
            // alert('Sign Up succesful. Please return to the Login Page')

            // nav('/login')
        }
        if (data.success === 0) {

        }
    }, [state])
    const handleUpdate = useCallback(async () => {
        let token = sessionStorage.getItem('auth')
        const imageData = state.imgUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(imageData, 'base64');
        
        // create a new Blob object with the binary data from the buffer
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        debugger

        let params = {
            email: state.email,
            // dob: state.dob,
            // address: state.address,
            //    password: state.password,
            // gender: 'M',
            // phoneNumber: state.phoneNb,
            user_id: token,
            profile_picture: blob
        }
        console.log(params)
        const data = await FetchData('http://localhost:3001/api/users/updateUserProfile', 'post', params)
        if (data.success === 1) {
            console.log('username', state.username);
            Swal.fire({
                title: "Success",
                text: "Sign Up succesful. Please return to the Login Page",
                icon: "success",
                confirmButtonText: "OK",
              });


           // alert('Sign Up succesful. Please return to the Login Page')

            // nav('/login')
        }
        if (data.success === 0) {

        }
    }, [state])
    // const handlePassConfirm = useCallback(
    //     (e) => {


    //         setObj(item => ({
    //             ...item, passConfirmation: e.target.value
    //         }))
    //         // console.log(obj.passConfirmation)
    //     }, [obj.passConfirmation])
    // const handlePass = useCallback(
    //     (e) => {
    //         setObj(item => ({
    //             ...item, password: e.target.value
    //         }))
    //         // console.log(obj.password)
    //     }, [obj.password])
    // const handleUname = useCallback(
    //     (e) => {

    //         setObj(item => ({
    //             ...item, username: e.target.value
    //         }))
    //         // console.log(obj.username)
    //     }, [obj.username])
    const onUpld = useCallback((imageUrl) => setState(prv => { return { ...prv, imgUrl: imageUrl } }), [])
    return (
        <>
            {loc.pathname === '/editProfile' && <NavigationBar />}
            <div className="row ml-5">
                <div className="col-12">
                    {/* <div className="row">
                    <div className="col-2 offset-10">
                      
                    </div>
                </div> */}
                    <div className="row mt-3" >
                        {loc.pathname === '/editProfile' && <div className="col-7 ml-4 title text-primary">
                            Edit Your Profile
                        </div>}
                        {loc.pathname === '/signUp' && <div className="col-7 ml-4 title text-primary">
                            Sign Up
                        </div>}
                        <div className="col-2 offset-3 ml-4 title text-primary">
                            <button className="btn btn-danger" onClick={handleBack}>Back</button>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-3">Username</div>
                        <div className="col-5">
                            <input type="text" className="form-control" disabled={loc.pathname === '/editProfile'} value={state.username} name="username" onChange={handleChange} />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3 required">Email</div>
                        <div className="col-5">
                            <input type="text" className="form-control " value={state.email} name="email" onChange={handleChange} />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">Password</div>
                        <div className="col-5 ">
                            <input type="password" className="form-control " value={state.password} name="password" onChange={handleChange} ></input>
                        </div>
                    </div>


                    <div className="row mt-2">
                        <div className="col-3">Password Confirmation</div>
                        <div className="col-5 ">
                            <input type="text" className="form-control " value={state.passwordConfirm} name="passwordConfirm" onChange={handleChange} ></input>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">Address</div>
                        <div className="col-5 ">
                            <input type="text" className="form-control " value={state.address} name="address" onChange={handleChange} ></input>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">Sex</div>
                        <div className="col-2 ">
                            <input type="text" className="form-control " value={state.sex} name="sex" onChange={handleChange} ></input>
                        </div>
                        <div className="col-1">Date of Birth</div>
                        <div className="col-2 ">
                            <input type="text" className="form-control " value={state.dob} name="dob" onChange={handleChange} ></input>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">Phone Number</div>
                        <div className="col-5 ">
                            <input type="number" className="form-control " value={state.phoneNb} name="phoneNb" onChange={handleChange} ></input>
                        </div>
                    </div>
                    {/* <div className="row mt-2">
                        <div className="col-3">Sports</div>
                        <div className="col-5">
                            <Select
                                defaultValue={state.sports}
                                onChange={(e) => {
                                    setState(prv => {
                                        return {
                                            ...prv,
                                            sports: e.value
                                        }
                                    })
                                }}
                                options={state.sportsOptions}
                            />
                        </div>
                    </div> */}
                    <div className='row'>
                        <div className=" ui small image">
                            <FileDialogue imgUrl={state.imgUrl} onUpload={onUpld} />
                        </div>
                    </div>

                    {loc.pathname === '/editProfile' && <div className="row mt-5">

                        <button type="button" className="btn btn-warning offset-7 col-1" style={{ backgroundColor: 'yellow', color: 'black' }}>Undo</button>
                        <button type="button" onClick={handleUpdate} className="btn btn-success col-1 offset-1 " style={{ backgroundColor: 'green', color: 'white' }}>Save</button>

                    </div>}
                    {loc.pathname === '/signUp' && <div className="row mt-5">

                        {/* <button type="button" className="btn btn-warning offset-7 col-1" style={{ backgroundColor: 'yellow', color: 'black' }}>Undo</button> */}
                        <button type="button" onClick={handleSaveUser} className="btn btn-success col-2 offset-1 " style={{ backgroundColor: 'green', color: 'white' }}>Sign Up</button>

                    </div>}
                </div>
            </div>
        </>
    )
}
