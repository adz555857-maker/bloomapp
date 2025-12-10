
import React, { useState } from 'react';
import { User, Copy, Check, Search, Plus, X, Heart, Users, Sprout, Crown, ArrowRight } from 'lucide-react';
import { FriendProfile, Party } from '../types';
import Plant from './Plant';
import { mockFetchFriend } from '../services/storageService';

interface SocialViewProps {
  userName: string;
  myFriendCode: string;
  friends: FriendProfile[];
  parties: Party[];
  onAddFriend: (friend: FriendProfile) => void;
  onCreateParty: (name: string) => void;
  onJoinParty: (code: string) => Promise<boolean>;
}

const SocialView: React.FC<SocialViewProps> = ({ 
  userName, 
  myFriendCode, 
  friends, 
  parties, 
  onAddFriend,
  onCreateParty,
  onJoinParty
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'parties'>('friends');
  
  // Friends State
  const [showMyCode, setShowMyCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

  // Party State
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [joinPartyInput, setJoinPartyInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addInput.trim()) return;
    
    if (addInput.trim().toUpperCase() === myFriendCode) {
        setSearchError("You can't add yourself!");
        return;
    }
    if (friends.some(f => f.friendCode === addInput.trim().toUpperCase())) {
        setSearchError("You are already friends!");
        return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const friend = await mockFetchFriend(addInput);
      if (friend) {
        onAddFriend(friend);
        setAddInput('');
      } else {
        setSearchError("Friend not found. Try 'ROSE-8821'");
      }
    } catch (err) {
      setSearchError("Connection error.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    onCreateParty(newPartyName);
    setNewPartyName('');
    setShowCreateParty(false);
  };

  const handleJoinPartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinPartyInput.trim()) return;

    setIsJoining(true);
    setJoinError('');

    try {
        const success = await onJoinParty(joinPartyInput);
        if (success) {
            setJoinPartyInput('');
        } else {
            setJoinError("Party not found. Try 'WELL-2024'");
        }
    } catch (e) {
        setJoinError("Error joining party.");
    } finally {
        setIsJoining(false);
    }
  };

  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  return (
    <div className="w-full max-w-md mx-auto animate-grow space-y-6">
      
      {/* TABS */}
      <div className="flex p-1 bg-earth-100 dark:bg-stone-800 rounded-2xl mx-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-white dark:bg-stone-600 shadow-sm text-nature-700 dark:text-white' : 'text-gray-500 dark:text-stone-400'}`}
        >
            Friends
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'parties' ? 'bg-white dark:bg-stone-600 shadow-sm text-nature-700 dark:text-white' : 'text-gray-500 dark:text-stone-400'}`}
        >
            Parties
        </button>
      </div>

      {activeTab === 'friends' ? (
        <>
          {/* HEADER: MY PROFILE */}
          <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-earth-200 dark:border-stone-800 text-center">
             <div 
               onClick={() => setShowMyCode(true)}
               className="w-20 h-20 mx-auto bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center text-nature-600 dark:text-nature-400 mb-4 cursor-pointer hover:scale-105 transition-transform"
             >
                <User size={40} />
             </div>
             <h2 
               onClick={() => setShowMyCode(true)}
               className="text-2xl font-bold text-nature-900 dark:text-stone-100 cursor-pointer hover:text-nature-600 dark:hover:text-nature-400 transition-colors"
             >
               {userName}
             </h2>
             <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Tap name to see Friend Code</p>

             {/* ADD FRIEND FORM */}
             <form onSubmit={handleSearchFriend} className="mt-6 relative">
                <input 
                  type="text" 
                  placeholder="Enter Friend Code..."
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value.toUpperCase())}
                  className="w-full pl-4 pr-12 py-3 bg-earth-50 dark:bg-stone-800 border border-earth-200 dark:border-stone-700 rounded-xl focus:border-nature-500 focus:outline-none dark:text-white transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isSearching || !addInput}
                  className="absolute right-2 top-2 p-1.5 bg-nature-500 text-white rounded-lg hover:bg-nature-600 disabled:opacity-50 disabled:bg-gray-400"
                >
                  {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
                </button>
             </form>
             {searchError && <p className="text-red-500 text-xs mt-2 font-bold">{searchError}</p>}
          </div>

          {/* FRIENDS LIST */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 px-2 flex items-center gap-2">
                <Heart size={18} className="text-red-400" fill="currentColor" /> Community Garden
            </h3>
            
            {friends.length === 0 ? (
              <div className="text-center py-8 text-stone-400 dark:text-stone-600 bg-white/50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                 <p>No friends yet.</p>
                 <p className="text-xs mt-1">Try adding "ROSE-8821"</p>
              </div>
            ) : (
              friends.map((friend, idx) => {
                 const completedCount = friend.habits.filter(h => h.completedDates.includes(today)).length;
                 const total = friend.habits.length;
                 const percent = total > 0 ? (completedCount / total) * 100 : 0;

                 return (
                   <div 
                     key={idx} 
                     onClick={() => setSelectedFriend(friend)}
                     className="bg-white dark:bg-stone-900 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-earth-100 dark:border-stone-800 hover:border-nature-300 hover:shadow-md cursor-pointer transition-all"
                   >
                     <div className="w-16 h-16 bg-nature-50 dark:bg-stone-800 rounded-full flex items-center justify-center overflow-visible">
                        <Plant stage={friend.plant.stage} health={friend.plant.health} showText={false} className="w-16 h-16" />
                     </div>
                     
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-lg text-stone-800 dark:text-stone-200">{friend.name}</span>
                            <span className="text-xs bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-300 px-2 py-0.5 rounded-full font-bold">Lvl {friend.plant.level}</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-nature-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-xs text-stone-400 mt-1">{completedCount}/{total} Habits Done</p>
                     </div>
                   </div>
                 );
              })
            )}
          </div>
        </>
      ) : (
        <>
            {/* PARTY ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowCreateParty(true)}
                  className="bg-nature-500 text-white p-4 rounded-2xl shadow-lg shadow-nature-200 dark:shadow-none hover:bg-nature-600 transition-colors flex flex-col items-center gap-2"
                >
                    <Plus size={24} />
                    <span className="font-bold text-sm">Create Party</span>
                </button>
                <div className="relative">
                    <form onSubmit={handleJoinPartySubmit} className="h-full">
                        <input 
                            type="text" 
                            placeholder="Join Code..."
                            value={joinPartyInput}
                            onChange={(e) => setJoinPartyInput(e.target.value.toUpperCase())}
                            className="w-full h-full bg-white dark:bg-stone-800 border border-earth-200 dark:border-stone-700 rounded-2xl p-4 text-center font-bold text-stone-800 dark:text-white focus:border-nature-500 focus:outline-none placeholder-gray-400"
                        />
                        <button type="submit" disabled={isJoining || !joinPartyInput} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-nature-100 dark:bg-stone-700 rounded-full text-nature-700 dark:text-stone-300 hover:bg-nature-200">
                           {isJoining ? <div className="w-4 h-4 border-2 border-nature-600 border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={16} />}
                        </button>
                    </form>
                </div>
            </div>
            {joinError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{joinError}</p>}

            {/* PARTIES LIST */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 px-2 flex items-center gap-2">
                    <Users size={18} className="text-blue-400" fill="currentColor" /> Active Parties
                </h3>
                
                {parties.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 dark:text-stone-600 bg-white/50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                        <p>You aren't in any parties yet.</p>
                        <p className="text-xs mt-1">Create one or join with a code!</p>
                    </div>
                ) : (
                    parties.map((party) => (
                        <div 
                          key={party.id}
                          onClick={() => setSelectedParty(party)}
                          className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-earth-100 dark:border-stone-800 hover:border-nature-300 hover:shadow-md cursor-pointer transition-all relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-stone-800 dark:text-stone-200">{party.name}</h4>
                                        <p className="text-xs text-stone-500">{party.members.length} Members</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className="text-xs text-stone-400 font-mono mb-1">CODE</div>
                                     <div className="font-mono font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">{party.code}</div>
                                </div>
                            </div>
                            
                            {/* Decorative Plant in BG */}
                            <div className="absolute -bottom-4 -right-4 opacity-20 transform scale-75 rotate-12 transition-transform group-hover:scale-90 pointer-events-none">
                                <Plant stage={party.plant.stage} health={party.plant.health} showText={false} className="w-32 h-32" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
      )}

      {/* CREATE PARTY MODAL */}
      {showCreateParty && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateParty(false)} />
             <div className="relative w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl p-6 animate-grow">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Name Your Party</h3>
                     <button 
                        onClick={() => setShowCreateParty(false)} 
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                     >
                        <X size={24} />
                     </button>
                 </div>
                 <form onSubmit={handleCreatePartySubmit}>
                     <input 
                       type="text" 
                       placeholder="e.g. The Morning Club" 
                       value={newPartyName}
                       onChange={(e) => setNewPartyName(e.target.value)}
                       autoFocus
                       className="w-full p-4 bg-earth-50 dark:bg-stone-900 border border-earth-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:border-nature-500 focus:outline-none mb-4"
                     />
                     <div className="flex gap-2">
                         <button type="button" onClick={() => setShowCreateParty(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl">Cancel</button>
                         <button type="submit" disabled={!newPartyName.trim()} className="flex-1 py-3 bg-nature-600 text-white font-bold rounded-xl hover:bg-nature-700">Create</button>
                     </div>
                 </form>
             </div>
         </div>
      )}

      {/* PARTY DETAIL MODAL */}
      {selectedParty && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedParty(null)} />
             <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-grow">
                 {/* Header */}
                 <div className="p-4 bg-blue-50 dark:bg-stone-800 border-b border-blue-100 dark:border-stone-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{selectedParty.name}</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold tracking-wider">CODE: {selectedParty.code}</p>
                    </div>
                    <button onClick={() => setSelectedParty(null)} className="p-2 bg-white dark:bg-stone-700 rounded-full text-stone-500 dark:text-stone-300 shadow-sm">
                        <X size={20} />
                    </button>
                 </div>

                 <div className="overflow-y-auto p-0 pb-6">
                    {/* Big Group Plant */}
                    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-stone-800 dark:to-stone-900 p-8 flex flex-col items-center justify-center border-b border-earth-100 dark:border-stone-800">
                         <div className="relative">
                            <Plant stage={selectedParty.plant.stage} health={selectedParty.plant.health} showText={false} className="w-56 h-56" />
                            {/* Group Level Badge */}
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white dark:border-stone-800">
                                Party Lvl {selectedParty.plant.level}
                            </div>
                         </div>
                         <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">Group Garden</h2>
                         <p className="text-stone-500 dark:text-stone-400 text-sm">Grows when everyone stays consistent!</p>
                    </div>

                    {/* Member List */}
                    <div className="p-6">
                        <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-4 flex items-center gap-2">
                            <Crown size={18} className="text-yellow-500" /> Party Members
                        </h4>
                        <div className="space-y-3">
                            {selectedParty.members.map((member, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-earth-50 dark:bg-stone-800 border border-earth-100 dark:border-stone-700">
                                    <div className="w-10 h-10 bg-white dark:bg-stone-700 rounded-full flex items-center justify-center overflow-hidden border border-earth-200 dark:border-stone-600">
                                         <Plant stage={member.plant.stage} health={member.plant.health} showText={false} className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">{member.name}</div>
                                        <div className="text-xs text-stone-500">Lvl {member.plant.level} • {member.plant.stage}</div>
                                    </div>
                                    {member.habits.length > 0 && member.habits.every(h => h.completedDates.includes(today)) && (
                                        <div className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-bold">
                                            Done!
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
             </div>
         </div>
      )}

      {/* FRIEND CODE MODAL */}
      {showMyCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setShowMyCode(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl p-8 text-center animate-grow">
                 <button 
                    onClick={() => setShowMyCode(false)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                 >
                    <X size={24} />
                 </button>
                 <h3 className="text-xl font-bold text-nature-900 dark:text-stone-100 mb-4">Your Friend Code</h3>
                 <div className="bg-earth-100 dark:bg-stone-900 p-4 rounded-xl mb-6 border-2 border-dashed border-nature-300 dark:border-stone-600">
                    <p className="text-3xl font-mono font-black text-stone-800 dark:text-white tracking-widest">{myFriendCode}</p>
                 </div>
                 <button 
                   onClick={handleCopyCode}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-nature-600 text-white rounded-xl font-bold hover:bg-nature-700 transition-colors"
                 >
                    {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copied!' : 'Copy Code'}
                 </button>
            </div>
        </div>
      )}

      {/* FRIEND DETAIL MODAL */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSelectedFriend(null)} />
             <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-grow">
                 <div className="p-4 bg-earth-50 dark:bg-stone-800 border-b border-earth-100 dark:border-stone-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-nature-900 dark:text-stone-100">{selectedFriend.name}'s Garden</h3>
                        <p className="text-xs text-stone-500">Code: {selectedFriend.friendCode}</p>
                    </div>
                    <button onClick={() => setSelectedFriend(null)} className="p-2 bg-white dark:bg-stone-700 rounded-full text-stone-500 dark:text-stone-300 shadow-sm">
                        <X size={20} />
                    </button>
                 </div>

                 <div className="overflow-y-auto p-6 space-y-6">
                    <div className="bg-gradient-to-b from-nature-50 to-white dark:from-stone-800 dark:to-stone-900 rounded-2xl p-6 border border-nature-100 dark:border-stone-700">
                         <Plant stage={selectedFriend.plant.stage} health={selectedFriend.plant.health} />
                    </div>

                    <div>
                        <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-3">Today's Goals</h4>
                        <div className="space-y-3">
                            {selectedFriend.habits.map((h) => {
                                const isDone = h.completedDates.includes(today);
                                return (
                                    <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-earth-50 dark:bg-stone-800 border border-earth-100 dark:border-stone-700">
                                        <span className={`font-medium ${isDone ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                                            {h.title} {h.type === 'numeric' && `(${h.target} ${h.unit})`}
                                        </span>
                                        {isDone ? (
                                            <div className="w-6 h-6 bg-nature-500 rounded-full flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-stone-300 dark:border-stone-600 rounded-full" />
                                        )}
                                    </div>
                                )
                            })}
                             {selectedFriend.habits.length === 0 && <p className="text-stone-400 text-sm text-center italic">No public habits.</p>}
                        </div>
                    </div>
                 </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default SocialView;
