import {
  GET_QUESTIONLIST,
  ADD_QUESTION,
  GET_DETAILS,
  FILTER_CATEGORY,
  FILTER_CATEGORY2,
  FILTER_RATING,
  GET_CATEGORIES,
  SEARCH_QUESTION,
} from "../../constants";

const initialState = {
  allQuestions: [],
  questions: [],
  detail: [],
  categories: [],
  filterquestion:[]
};

const questionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_QUESTIONLIST:
      return {
        ...state,
        questions: action.payload,
        allQuestions: action.payload
      };
    case ADD_QUESTION:
      return {
        ...state,
        questions: [...state.questions, action.payload],
      };
    case GET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    case GET_DETAILS:
      return {
        ...state,
        detail: action.payload,
      };
    case FILTER_CATEGORY:
      const questionss = state.questions.data;
      const filter =
        action.payload === "All"
          ? state.questions.data
          : questionss.filter((e) =>
              e.categories.map((e) => e.category).includes(action.payload)
            );
      return {
        ...state,
        allQuestions: {
          data: filter,
          error: null,
        },
        filterquestion:{
          data: filter,
          error: null,
        }
      };
    case FILTER_CATEGORY2:
      const questionss2 = state.allQuestions.data;
       const filter2 = 
       action.payload === "All"
          ? state.filterquestion.data
          : questionss2.filter((e) =>
              e.categories.map((e) => e.category).includes(action.payload)
            );
      return {
        ...state,
        allQuestions: {
          data: filter2,
          error: null,
        },
      };
    case FILTER_RATING:
      const arra = state.allQuestions.data.sort(function (a, b) {
        if (action.payload === "asc") {
          if (a.votesxquestions.length > b.votesxquestions.length) return 1;
          if (b.votesxquestions.length > a.votesxquestions.length) return -1;
          return 0;
        }
        if (action.payload === "des") {
          if (a.votesxquestions.length > b.votesxquestions.length) return -1;
          if (b.votesxquestions.length > a.votesxquestions.length) return 1;
          return 0;
        }
      });
      return {
        ...state,
        allQuestions: {
          error: null,
          data: arra.slice(),
        },
      };
    case SEARCH_QUESTION:
      return {
        ...state,
        allQuestions:{
            error: null,
            data: action.payload.data
        }
      };

    default:
      return state;
  }
};

export default questionReducer;
