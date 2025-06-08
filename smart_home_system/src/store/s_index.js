import { createStore } from 'vuex'
import { api } from '@/services/api'

export default createStore({
  state: {
    devices: [],
    rooms: [],
    scenes: [],
    selectedRoom: 'all',
    loading: false,
    error: null,
    user: null
  },
  mutations: {
    SET_DEVICES(state, devices) {
      state.devices = devices
    },
    SET_ROOMS(state, rooms) {
      state.rooms = rooms
    },
    SET_SCENES(state, scenes) {
      state.scenes = scenes
    },
    SET_SELECTED_ROOM(state, room) {
      state.selectedRoom = room
    },
    UPDATE_DEVICE(state, updatedDevice) {
      const index = state.devices.findIndex(
        (device) => device.id === updatedDevice.id
      )
      if (index !== -1) {
        state.devices[index] = { ...state.devices[index], ...updatedDevice }
      }
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    //添加设备
    ADD_DEVICE(state, device) {
      state.devices.push(device)
    },
    //删除设备
    REMOVE_DEVICE(state, deviceId) {
      state.devices = state.devices.filter(device => device.id !== deviceId);
    },
    SET_USER(state, user) {
      state.user = user
    },
    CLEAR_USER(state) {
      state.user = null
    },

    //添加场景
    ADD_SCENE(state, scene) {
      console.log(scene)
      console.log(state.scenes)
      state.scenes.push(scene)
      // localStorage.setItem('scenes', JSON.stringify(state.scenes))
    },
    //注册功能的增加！
    REGISTER_SUCCESS(state, user) {
      state.user = user
    },
    REGISTER_ERROR(state, error) {
      state.error = error
    },

  },
  actions: {
    //删除设备
    async deleteDevice({ commit }, deviceId) {
      try {
        // 如果使用 json-server
        await api.delDevice(deviceId)
        // 更新前端状态
        commit('REMOVE_DEVICE', deviceId);
        return true;
      } catch (error) {
        console.error('删除设备失败:', error);
        return false;
      }
    },
    //添加设备
    async addDevice({ commit }, device) {
      commit('SET_LOADING', true);
      try {
        // 1. 调用模拟的 API 添加设备（假设使用 axios 或 fetch）
        const response = await api.postDevice(device)
        
        // 2. 提交 mutation 更新前端状态（可选，取决于是否需要前端缓存）
        commit('ADD_DEVICE', response.data);
        
        return true; // 表示成功
      } catch (error) {
        commit('SET_ERROR', '添加设备失败');
        console.error(error);
        return false; // 表示失败
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchDevices({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.getAllDevices()
        commit('SET_DEVICES', response.data)
      } catch (error) {
        commit('SET_ERROR', '获取设备列表失败')
        console.error(error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchRooms({ commit }) {
      try {
        const response = await api.getRooms()
        commit('SET_ROOMS', response.data)
      } catch (error) {
        commit('SET_ERROR', '获取房间列表失败')
        console.error(error)
      }
    },
    async fetchScenes({ commit }) {
      try {
        const response = await api.getScenes()
        commit('SET_SCENES', response.data)
      } catch (error) {
        commit('SET_ERROR', '获取场景列表失败')
        console.error(error)
      }
    },
    setSelectedRoom({ commit }, room) {
      commit('SET_SELECTED_ROOM', room)
    },
    async toggleDevice({ commit }, { id, status }) {
      try {
        const response = await api.updateDevice(id, { status })
        commit('UPDATE_DEVICE', response.data)
      } catch (error) {
        commit('SET_ERROR', '设备状态更新失败')
        console.error(error)
      }
    },
    async updateDevice({ commit }, { id, data }) {
      try {
        const response = await api.updateDevice(id, data)
        commit('UPDATE_DEVICE', response.data)
      } catch (error) {
        commit('SET_ERROR', '设备更新失败')
        console.error(error)
      }
    },
    async activateScene({ commit, dispatch }, sceneId) {
      commit('SET_LOADING', true)
      try {
        await api.activateScene(sceneId)
        // 重新获取设备状态
        dispatch('fetchDevices')
      } catch (error) {
        commit('SET_ERROR', '场景激活失败')
        console.error(error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async login({ commit }, credentials) {
      try {
        const response = await api.getUsers({
            name: credentials.username,
            password: credentials.password
        })
        // console.log(response.data[0])
        if (response.data.length > 0) {
          commit('SET_USER', response.data[0]);
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    },
    //添加场景
    // 创建场景
    async createScene({ commit }, scene) {
      commit('SET_LOADING', true);
      try {
        // 调用 API 保存到 db.json
        const response = await api.createScene({
          ...scene,
          id: Date.now().toString(), // 生成唯一ID
          createdAt: new Date().toISOString()
        });
        
        // 更新本地状态
        commit('ADD_SCENE', response.data);
        return true;
      } catch (error) {
        commit('SET_ERROR', '创建场景失败');
        console.error(error);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    //激活场景
    activateScene({ state ,commit, dispatch }, sceneId) {
      return new Promise((resolve) => {
        // 模拟API请求
        setTimeout(() => {
          const scene = state.scenes.find(s => s.id === sceneId)
          if (scene) {
            alert(`场景 "${scene.name}" 已激活！`)
          }
          resolve()
        }, 500)
      })
    },

    // async register({ commit }, userData) {
    //   commit('SET_LOADING', true);
    //   commit('SET_ERROR', null);
      
    //   try {
    //     console.log('开始注册流程...', userData); // 调试日志
        
    //     // 1. 先检查用户名是否已存在
    //     const existingUsers = await api.getUsers({ name: userData.username });
    //     console.log('查询现有用户结果:', existingUsers); // 调试日志
        
    //     if (existingUsers.data.length > 0) {
    //       commit('SET_ERROR', '用户名已存在');
    //       return false;
    //     }
        
    //     // 2. 创建新用户 - 匹配你的 db.json 结构
    //     const newUser = {
    //       id: Date.now().toString(),
    //       name: userData.username,
    //       password: userData.password,
    //       role: 'member', // 默认角色改为 member
    //       permissions: ['read', 'write'] // 默认权限
    //     };
        
    //     // 如果有邮箱，添加邮箱字段
    //     if (userData.email) {
    //       newUser.email = userData.email;
    //     }
        
    //     console.log('准备创建用户:', newUser); // 调试日志
        
    //     // 3. 调用 API 保存用户
    //     const response = await api.postUser(newUser); // 注意：可能是 postUser 而不是 createUser
    //     console.log('API 响应:', response); // 调试日志
        
    //     // 4. 注册成功后自动登录 - 使用现有的 mutation
    //     commit('SET_USER', response.data);
        
    //     return true;
    //   } catch (error) {
    //     console.error('注册失败详情:', error);
        
    //     // 使用现有的 SET_ERROR mutation
    //     if (error.response?.status === 404) {
    //       commit('SET_ERROR', 'API 接口不存在，请检查服务器配置');
    //     } else if (error.response?.status === 500) {
    //       commit('SET_ERROR', '服务器内部错误');
    //     } else {
    //       commit('SET_ERROR', '注册失败，请重试');
    //     }
        
    //     return false;
    //   } finally {
    //     commit('SET_LOADING', false);
    //   }
    // }
    async register({ commit }, userData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        console.log('开始注册...', userData);
        
        // 1. 检查用户名是否已存在
        const existingUsers = await api.getUsers({ name: userData.username });
        console.log('现有用户查询结果:', existingUsers);
        
        if (existingUsers.data.length > 0) {
          commit('SET_ERROR', '用户名已存在');
          return false;
        }
        
        // 2. 创建新用户数据
        const newUser = {
          id: Date.now().toString(),
          name: userData.username,
          password: userData.password,
          role: 'member',
          permissions: ['read', 'write']
        };
        
        if (userData.email) {
          newUser.email = userData.email;
        }
        
        console.log('准备创建用户:', newUser);
        
        // 3. 使用修复后的 API 方法
        const response = await api.createUser(newUser);
        console.log('创建用户成功:', response.data);
        
        // 4. 注册成功后自动登录
        commit('SET_USER', response.data);
        
        return true;
      } catch (error) {
        console.error('注册失败详情:', error);
        commit('SET_ERROR', '注册失败，请重试');
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    }

  },
  ////
  getters: {
    getDevicesByRoom: (state) => {
      if (state.selectedRoom === 'all') {
        return state.devices
      }
      return state.devices.filter(
        (device) => device.room === state.selectedRoom
      )
    },
    getDeviceById: (state) => (id) => {
      return state.devices.find((device) => device.id === id)
    },
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user
  },
  // 获取注册错误信息
  getRegisterError: state => state.error,
  
  // 检查是否正在加载
  isLoading: state => state.loading
})

