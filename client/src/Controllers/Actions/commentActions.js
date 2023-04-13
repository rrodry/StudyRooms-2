import axios from "axios";
import { URL_BACK } from "../../constants";

export const GET_COMMENT_LIST = "GET_COMMENT_LIST";
export const CREATE_COMMENT_ITEM = "CREATE_COMMENT_ITEM";
export const UPDATE_COMMENT_ITEM = "UPDATE_COMMENT_ITEM";
export const DELETE_COMMENT_ITEM = "DELETE_COMMENT_ITEM";


const baseUrl = URL_BACK; //'https://w9489.mocklab.io';

export const getCommentList = (questionId) => {

    return function (dispatch) {
        const token = localStorage.getItem("token")
        axios.get(`/comments/${questionId}`, {headers:{"Authorization":`Bearer ${token}`}})

            .catch(error => console.log("Action creator getCommentList:", error))
            .then(response => {
                dispatch({
                    type: GET_COMMENT_LIST,
                    payload: response.data.data
                });
            });
    }
}

export const createCommentItem = (commentItem) => {
    return function (dispatch) {
        const token = localStorage.getItem("token")
        axios.post(`/comments`, commentItem, {headers:{"Authorization":`Bearer ${token}`}})

            .catch(error => console.log("Action creator createCommentItem: ", error))
            .then(response => {
                dispatch({
                    type: CREATE_COMMENT_ITEM,
                    payload: response.data.data
                });
            });
    }
}

export const updateCommentItem = (commentItem) => {
    return function (dispatch) {
        const token = localStorage.getItem("token")
        axios.put(`/comments/${commentItem.id}`, commentItem, {headers:{"Authorization":`Bearer ${token}`}})

            .catch(error => console.log("Action creator updateCommentItem: ", error))
            .then(response => {
                dispatch({
                    type: UPDATE_COMMENT_ITEM,
                    payload: response.data.data
                });
            });
    }
}

export const deleteCommentItem = (commentItem) => {
    return function (dispatch) {
        const token = localStorage.getItem("token")
        axios.delete(`/comments/${commentItem.id}`, {headers:{"Authorization":`Bearer ${token}`}})

            .catch(error => console.log("Action creator deleteCommentItem: ", error))
            .then(() => {
                dispatch({
                    type: DELETE_COMMENT_ITEM,
                    payload: { id: commentItem.id, questionId: commentItem.questionId }
                });
            });
    }
}
