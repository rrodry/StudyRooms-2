import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import ReactStars from 'react-stars'; //source: https://www.npmjs.com/package/react-stars
import {
    getAnswerList,
    deleteAnswerItem,
    updateAnswerVote,
    sortAnswerList,
    updateAnswerRating,
    getRatingList,
    getVotingList,
    deleteAnswerVote,
} from "../../Controllers/Actions/answerActions";
import {
    SORT_BY_CREATION_ASC,
    SORT_BY_CREATION_DSC,
    SORT_BY_DATE_ASC,
    SORT_BY_DATE_DSC,
    SORT_BY_VOTES_ASC,
    SORT_BY_VOTES_DSC,
    SORT_BY_RATE_ASC,
    SORT_BY_RATE_DSC,
} from "../../Controllers/Reducer/answerReducer";
import AnswerCreate from "./AnswerCreate";
import './AnswerList.css';
import AnswerEdit from "./AnswerEdit";
import upVote from '../../recursos/thumbs.png'
import downVote from '../../recursos/thumb-down.png'
import donation from '../../recursos/donation.svg'
import sweetalert from 'sweetalert';

export default function AnswerList ({questionId}) {

    
    const userInfo = useSelector(state => state.loginReducer.userInfo);
    const userId = userInfo.id;
    const dispatch = useDispatch();
    const answerList = useSelector(state => state.answerStore.answerList);
    const ratingList = useSelector(state => state.answerStore.ratingList);
    const votingList = useSelector(state => state.answerStore.votingList);
    const [showEditForm, setShowEditForm] = useState(false);
    const [answerEditId, setAnswerEditId] = useState(null);
    const sortOption = useSelector(state => state.answerStore.sortOption);

    useEffect(() => {
        if (questionId) {
            dispatch(getAnswerList(questionId));
        }
    }, [dispatch, questionId]);

    useEffect(() => {
        if (userId && questionId && !ratingList) {
            dispatch(getRatingList(userId, questionId));
        }
    }, [dispatch, userId, questionId, answerList, ratingList])

    useEffect(() => {
        if (userId && questionId && !votingList) {
            dispatch(getVotingList(userId, questionId));
        }
    }, [dispatch, userId, questionId, answerList, votingList])

    function handleShowEditForm(answerId) {
        setAnswerEditId(answerId);
        setShowEditForm(!showEditForm);
    }

    function handleHideEditForm() {
        setAnswerEditId(null);
        setShowEditForm(!showEditForm);
    }

    function handleDeleteAnswerItem(answerItem) {
        sweetalert({
            title:"Action confirmation",
            text: "Do your really want to delete your answer?",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(value => {
            if(value) {
                dispatch(deleteAnswerItem(answerItem));
            }
        });
    }

    function showCreateForm() {
        if(!userInfo || !userInfo.id) {
            return false;
        }
        if(!answerList) {
            return true;
        }
        const answerItem = answerList.find(item =>
            item.userId === userId
        )
        return !answerItem;
    }

    function handleVoteUpClick(answerId, answerUserId) {
        if(userId !== answerUserId) {
            dispatch(updateAnswerVote({
                userId,
                answerId
            }));
        }
        else {
            sweetalert({
                title:"Action not allowed",
                text: `You can not vote for your own answer.`
            });
        }
    }

    function handleVoteDownClick(answerId, answerUserId) {
        if(userId !== answerUserId) {
            dispatch(deleteAnswerVote({
                userId,
                answerId
            }));
        }
        else {
            sweetalert({
                title:"Action not allowed",
                text: `You can not vote for your own answer.`
            });
        }
    }

    function handleOrderChange(event) {
        dispatch(sortAnswerList(event.target.value));
    }

    function handleRateChange(answerUserId, answerId, rating) {
        if(userId !== answerUserId) {
            dispatch(updateAnswerRating({userId, questionId, answerId, rating}));
        }
        else {
            sweetalert({
                title:"Action not allowed",
                text: `You can not rate your own answer.`
            });
        }
    }

    function getRatingValue(answerItem) {
        let ratingValue = 0;
        if (ratingList && ratingList.length !== 0) {
            const ratingItem = ratingList.find(item =>
                item.id === answerItem.id &&
                item.ratingxanswers &&
                item.ratingxanswers.length !== 0 &&
                item.ratingxanswers[0].userId === userId
            );
            if (ratingItem) {
                ratingValue = Number(ratingItem.ratingxanswers[0].rating);
            }
        }
        return ratingValue;
    }

    function getVotingValue(answerItem) {
        let votingValue = false;
        if (votingList && votingList.length !== 0) {
            const votingItem = votingList.find(item =>
                item.id === answerItem.id &&
                item.votesxanswers &&
                item.votesxanswers.length !== 0 &&
                item.votesxanswers[0].userId === userId
            );
            if (votingItem) {
                votingValue = votingItem.votesxanswers[0].rating;
            }
        }
        return votingValue;
    }

    function renderAnswerItem(answerItem) {
        let ratingValue = getRatingValue(answerItem);
        let votingValue = getVotingValue(answerItem);

        return (
            <div className='singleAnswer' key={answerItem.id}>
                <div className='singleAnswerTitle'>
                    <div className="ratingContainer">
                        <h3>Answer from {answerItem.user.userName}</h3>
                        {answerItem.user.isPremium && (
                            <img className='donation' src={donation} alt={"donation"} height="50px"/>
                        )}
                    </div>

                    <div className='singleAnswerInfo'>
                        <div className='ratingLikeContainer'>
                            <div className="ratingContainer">
                                <span><b>Rating:</b> {Number(answerItem.ratingAverage).toFixed(1)} </span>
                                <ReactStars
                                    className="stars"
                                    value={Number(answerItem.ratingAverage)}
                                    edit={false}
                                    size={22}
                                />
                                <span>({answerItem.ratingCount} rates) </span>
                            </div>

                            <span className="voteText" >
                                <img src={upVote} alt="" height="20px" width="20px" /> {answerItem.voteCount} likes
                            </span>
                        </div>
                        <span> <b>Last update:</b> {answerItem.updatedAt}</span>
                    </div>
                </div>
                <p>{answerItem.answer}</p>
                {userId === answerItem.userId && !(showEditForm && answerEditId === answerItem.id) && (
                    <>
                        <button className="buttonAction"
                                onClick={() => handleShowEditForm(answerItem.id)}
                                disabled={showEditForm}
                        >
                            Edit
                        </button>
                        <button className="buttonCancel"
                        onClick={() => handleDeleteAnswerItem(answerItem)}
                        disabled={showEditForm}
                        >
                        Delete
                        </button>
                    </>
                )}

                {userId !== answerItem.userId && (
                <>
                    <div className="personalRating">
                        <span><b>Your rating: </b></span>
                        <ReactStars
                            value={ratingValue}
                            onChange={(newRate) => handleRateChange(answerItem.userId, answerItem.id, newRate)}
                            edit={true}
                            size={30}
                        />
                        {ratingValue.toFixed(1)} stars
                    </div>

                    {votingValue ? (
                        <>
                            <span className="voteLike" onClick={() => handleVoteDownClick(answerItem.id, answerItem.userId)}>
                                <span><b>Remove your vote:</b></span>
                                <img src={downVote} alt="" height="20px" width="20px" />
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="voteLike" onClick={() => handleVoteUpClick(answerItem.id, answerItem.userId)}>
                                <span><b>Add your vote:</b></span>
                                <img src={upVote} alt="" height="20px" width="20px" />
                            </span>
                        </>
                    )}
                </>
                )}

                {showEditForm && answerEditId === answerItem.id && (
                    <AnswerEdit userId={answerItem.userId}
                                questionId={questionId}
                                answerItem={answerItem}
                                handleAction={handleHideEditForm}
                                handleCancel={handleHideEditForm}
                    />
                )}
            </div>
        );
    }

    function renderAnswerList() {
        if (!answerList || answerList.length === 0) {
            return (
                <div className='answerListContainer container'>
                    <h3>Be the first one to add an answer to this question...</h3>
                </div>
            );
        }
        return (
            <div className='answerListContainer container'>
                <div className="singleAnswerTitle">
                    <h2>Answer List</h2>
                    <div className='filterSelect'>
                        <label htmlFor="sort-list"><b>Order by: </b></label>
                        <select id="sort-list"
                                onChange={(e) => {handleOrderChange(e)}}
                                value={sortOption}
                        >
                            <option value={SORT_BY_CREATION_ASC}>Creation ascending</option>
                            <option value={SORT_BY_CREATION_DSC}>Creation descending</option>
                            <option value={SORT_BY_DATE_ASC}>Date ascending</option>
                            <option value={SORT_BY_DATE_DSC}>Date descending</option>
                            <option value={SORT_BY_VOTES_ASC}>Votes ascending</option>
                            <option value={SORT_BY_VOTES_DSC}>Votes descending</option>
                            <option value={SORT_BY_RATE_ASC}>Rating ascending</option>
                            <option value={SORT_BY_RATE_DSC}>Rating descending</option>
                        </select>
                    </div>
                </div>
                {answerList.map(item => renderAnswerItem(item))}
            </div>
        );
    }

    return (
        <div>
            {renderAnswerList()}
            {showCreateForm() &&
                <AnswerCreate userId={userId}
                              questionId={questionId}
                />
            }
        </div>
    );
}
