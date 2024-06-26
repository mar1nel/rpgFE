import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import Modal from 'react-modal';
import './animation.css';
import RedButton from "./RedButton";
import {useNavigate} from "react-router-dom";
import WhiteButton from "./WhiteButton";

interface Stat {
    type: string;
    value: number;
}

interface Enemy {
    _id: string;
    enemyName: string;
    enemyLevel: number;
    enemyCost: number;
    enemyFightDuration: number;
    enemyStats: Stat[];
    baseMoneyReward: number;
    baseExpReward: number;
    imageUrl: string;
}

const frameImages = [
    '/figmaExports/components/modalTree.png',
    '/figmaExports/components/modalGoblin.png',
    '/figmaExports/components/modalSlime.png',
    '/figmaExports/components/modalCat.png',
    '/figmaExports/components/modalDruid.png'
];

const DungeonComponent: React.FC = () => {
    const { user, setUser } = useUser();
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [isFighting, setIsFighting] = useState(false);
    const [fightProgress, setFightProgress] = useState(0);
    const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);

    const frameImage = '/figmaExports/FrameDungeon.png'; // Ensure this path is correct
    const navigate = useNavigate();
 
    const navigateToMap = () => {
        navigate('/map');
    };
    useEffect(() => {
        const fetchEnemies = async () => {
            if (user) {
                try {
                    const response = await axios.get(`http://localhost:8080/enemies/level/${user.dungeonLevel}`);
                    console.log('Fetched enemies:', response.data.enemies);
                    setEnemies(response.data.enemies);
                } catch (error) {
                    console.error('Failed to fetch enemies:', error);
                }
            }
        };

        fetchEnemies();
    }, [user]);

    const handleFight = async (enemyId: string) => {
        if (user && selectedEnemy) {
            setIsFighting(true);
            setFightProgress(0);
            const fightDuration = selectedEnemy.enemyFightDuration;
            const interval = 100; // Update the progress bar every 100ms
            const totalIntervals = fightDuration * 1000 / interval;
            let currentInterval = 0;

            const fightInterval = setInterval(() => {
                currentInterval++;
                setFightProgress((currentInterval / totalIntervals) * 100);

                if (currentInterval >= totalIntervals) {
                    clearInterval(fightInterval);
                    completeFight(enemyId);
                }
            }, interval);
        }
    };

    const completeFight = async (enemyId: string) => {
        try {
            const response = await axios.post('http://localhost:8080/fights', {
                userId: user!._id,
                enemyId: enemyId
            });
            console.log('Fight result:', response.data);
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fight enemy:', error);
        } finally {
            setIsFighting(false);
            setFightProgress(0);
            closeModal();
        }
    };

    const openModal = (enemy: Enemy) => {
        setSelectedEnemy(enemy);
        setIsModalClosing(false);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setModalIsOpen(false);
            setIsModalClosing(false);
        }, 300);
    };

    if (!user) {
        return <div>Please log in to view this page.</div>;
    }

    return (
        <div className="frame-box" style={{ position: 'relative', width: '1040px', height: '680px', marginLeft: "20%", marginTop: "60px" }}>
            <img src={frameImage} alt="Dungeon Frame" draggable="false" style={{ width: '1050px', height: 'auto' }} />

            <h1 className="text-above-dungeon"> DUNGEON LVL {user.dungeonLevel}</h1>

            <div style={{
                position: 'absolute',
                top: "100px",
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around'
            }}>
                {enemies.length === 0 ? (
                    <p style={{ color: "white" }}>No enemies found.</p>
                ) : (
                    enemies.map((enemy, index) => (
                        <div key={enemy._id} style={{ color: "white", display: 'flex', alignItems: 'center', margin: '-12px 0' }}>
                            <img src={enemy.imageUrl} alt={enemy.enemyName} style={{ width: '140px', height: '140px', marginRight: '20px' }} />
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0 }}>{enemy.enemyName}</p>
                                    <p style={{ margin: 0 }}>{enemy.enemyFightDuration}s</p>
                                </div>
                                <div style={{ width: '550px', backgroundColor: '#ccc', height: '20px', position: 'relative', marginTop: '5px' }}>
                                    <div style={{
                                        width: `${fightProgress}%`,
                                        height: '100%',
                                        backgroundColor: isFighting && selectedEnemy?._id === enemy._id ? '#d22f2f' : '#ccc'
                                    }} />
                                </div>
                            </div>
                            <button
                                onClick={() => openModal(enemy)}
                                disabled={isFighting || user.money < enemy.enemyCost}
                                style={{
                                    backgroundColor: user.money < enemy.enemyCost ? '#888' : '#d32f2f',
                                    color: 'white',
                                    padding: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginLeft: '20px'
                                }}
                            >
                                {user.money < enemy.enemyCost ? 'Not Enough Money' : 'Fight'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '650px', textAlign: 'center' }}>
                <RedButton text="Go to Map" onClick={navigateToMap} />
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                    content: {
                        width: '600px',
                        height: '529px',
                        margin: 'auto',
                        background: 'transparent',
                        border: 'none'
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                }}
            >
                {selectedEnemy && (
                    <div className={isModalClosing ? 'modal-content-leave' : 'modal-content'} style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
                        <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                            <h2 style={{ color: "black", marginTop: '20px', position: 'relative', zIndex: 2 }}>{selectedEnemy.enemyName}</h2>
                            <div style={{ position: 'relative', zIndex: 2, marginLeft: 90 }}>
                                <p>Level: {selectedEnemy.enemyLevel}</p>
                                <p>Cost: {selectedEnemy.enemyCost}</p>
                                <p>Fight Duration: {selectedEnemy.enemyFightDuration}s</p>
                                <p>Stats:</p>
                                <ul>
                                    {selectedEnemy.enemyStats.map((stat, index) => (
                                        <li key={index}>{`${stat.type}: ${stat.value}`}</li>
                                    ))}
                                </ul>
                                <p>Reward: {selectedEnemy.baseMoneyReward}</p>
                                <p>Experience: {selectedEnemy.baseExpReward}</p>
                            </div>
                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                                <WhiteButton
                                    onClick={() => handleFight(selectedEnemy._id)}
                                    text={user.money < selectedEnemy.enemyCost ? 'Not Enough Money' : 'Start Fight'}
                                    disabled={isFighting || user.money < selectedEnemy.enemyCost}
                                />
                            </div>
                        </div>
                        <img src={selectedEnemy.imageUrl} alt={selectedEnemy.enemyName} style={{ width: '400px', height: '400px', position: 'absolute', top: '55%', left: '-40px', transform: 'translateY(-50%)', zIndex: 3 }} />
                        <img src={frameImages[enemies.indexOf(selectedEnemy) % frameImages.length]} alt="Frame" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1 }} />
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default DungeonComponent;

