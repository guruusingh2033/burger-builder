import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burger-builder-76c99.firebaseio.com/'
});

export default instance;