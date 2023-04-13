import axios from "axios";
import {
  GET_QUESTIONLIST,
  ADD_QUESTION,
  GET_DETAILS,
  URL_BACK,
  GET_CATEGORIES,
  SEARCH_QUESTION,
  LOGICALDELETEQ
} from "../../constants";
// addQuestions getQuestions



export function getQuestions() {
    return async function (dispatch) {
        const token = localStorage.getItem("token")
        const info = await axios.get(`${URL_BACK}questions`, {headers:{"Authorization":`Bearer ${token}`}}, {});
        return dispatch({
            type: GET_QUESTIONLIST,
            payload: info.data
        })
    }
}
export function getCategories(){
    return async function (dispatch){
        const token = localStorage.getItem("token")
        const categories = await axios.get(`${URL_BACK}categories`, {headers:{"Authorization":`Bearer ${token}`}}, {})
        return dispatch({
            type:GET_CATEGORIES,
            payload: categories.data
        })
    }
}
export function addQuestions(data) {
    return async function (dispatch) {
        const token = localStorage.getItem("token")
        var info = await axios.post(`${URL_BACK}questions`,data, {headers:{"Authorization":`Bearer ${token}`}});
        return dispatch({
            type: ADD_QUESTION,
            payload: info.data
        })
    }
}

export function getDetail(id) {
    return async function (dispach) {
        try {
            const token = localStorage.getItem("token")
            var json = await axios.get(`${URL_BACK}questions/${id}`, {headers:{"Authorization":`Bearer ${token}`}});
            return dispach({
                type: GET_DETAILS,
                payload: json.data
            })
        } catch (error) {
            console.log(error)

        }
    }
  };
export function searchQuestion(text) {
  return async function (dispatch) {
    try {
      const token = localStorage.getItem("token")
      var json = await axios.get(`${URL_BACK}search/question?string=${text}`,{headers:{"Authorization":`Bearer ${token}`}});
      return dispatch({
        type: SEARCH_QUESTION,
        payload: json.data
      });
    } catch (error) {
      console.log(error);
    }
  };
}
export function logDelete(id){
  return async function (dispatch){
      try {
        const token = localStorage.getItem("token")
          var json = await axios.delete(`/questions/${id}`,{headers:{"Authorization":`Bearer ${token}`}})
          return dispatch({
              type: LOGICALDELETEQ,
              payload: json.data
              
          })
      }catch (error){
              console.log(error)
          }
        }}