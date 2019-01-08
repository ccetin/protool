'use strict'

class Digraph {
  constructor(options) {
    this.options = options || {}
    this.adjacencyList = {}
    this.data = {}
    this.isCyclic = null
  }

  adjacent(v) {
    return this.adjacencyList[v] || {}
  }

  getData(v) {
    return this.data[v]
  }

  adjacentList(v) {
    return Object.keys(this.adjacent(v))
  }

  isAdjacent(u, v) {
    return this.adjacencyList[u] && this.adjacencyList[u][v]
  }

  addVertex(v, data) {
    this.adjacencyList[v] = this.adjacent(v)
    if (data) {
      this.data[v] = data
    }
    return this
  }

  addEdge(u, v) {
    this.addVertex(u)
    this.addVertex(v)
    this.adjacent(u)[v] = true
    this.isCyclic = null
    return this
  }

  removeVertex(v) {
    for (let u of Object.keys(this.adjacencyList)) {
      for (let w of this.adjacentList(u)) {
        if (w === v) {
          this.removeEdge(u, w)
        }
      }
    }
    delete this.adjacencyList[v]
    delete this.data[v]
    return this
  }

  removeEdge(u, v) {
    if (this.adjacencyList[u]) {
      const _adjacent = this.adjacent(u)
      delete _adjacent[v]
      this.adjacencyList[u] = _adjacent
    }
    this.isCyclic = null
    return this
  }

  vertices() {
    return Object.keys(this.adjacencyList)
  }

  reverse() {
    let graph = new Digraph()
    for (let v of this.vertices()) {
      for (let u of this.adjacent(v)) {
        graph.addEdge(u, v)
      }
    }
    return graph
  }

  depthFirstOrder() {
    let preOrder = []
    let postOrder = []
    let marked = {}
    let visit = (v) => {
      preOrder.push(v)
      marked[v] = true
      for (let u of this.adjacentList(v)) {
        if (!marked[u]) {
          visit(u)
        }
      }
      postOrder.push(v)
    }
    for (let v of this.vertices()) {
      if (!marked[v]) {
        visit(v)
      }
    }
    return {
      preOrder:  preOrder,
      postOrder: postOrder
    }
  }

  hasCycle() {
    if (this.isCyclic !== null) {
      return this.isCyclic
    }

    let _hasCycle = false
    let isVisited = {}
    let marked = {}
    let visit = (v) => {
      if (_hasCycle) {
        return
      }
      isVisited[v] = true
      marked[v] = true
      for (let u of this.adjacentList(v)) {
        if (_hasCycle) {
          return
        } else if (!marked[u]) {
          visit(u)
        } else if (isVisited[u]) {
          _hasCycle = true
        }
      }
      isVisited[v] = false
    }
    for (let v of this.vertices()) {
      if (!marked[v]) {
        visit(v)
      }
    }
    this.isCyclic = _hasCycle
    return this.isCyclic
  }

  topologicalSort() {
    if (this.hasCycle()) {
      throw new Error('Topological sort cannot be computed for cyclic directed graph')
    }
    const orders = this.depthFirstOrder()
    return orders.postOrder
  }

}

module.exports = Digraph
